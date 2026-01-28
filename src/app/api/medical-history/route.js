import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma'; // Assuming prisma is exported from here, verify path if needed
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Or wherever authOptions are

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const history = await prisma.patientMedicalHistory.findUnique({
            where: { userId: session.user.id },
            include: {
                user: { select: { gender: true, bloodGroup: true } },
                birthHistory: true,
                childhoodHistory: { include: { hospitalizations: true } },
                femaleHistory: { include: { pregnancies: true } },
                maleHistory: true,
                familyHistory: true,
                surgeries: true,
                allergies: true,
                accidents: { include: { injuries: true } },
            }
        });

        return NextResponse.json(history || {});
    } catch (error) {
        console.error("Error fetching medical history:", error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
        section,
        data,
        completionStatus
    } = body;

    // We will use nested upserts or updates based on the section
    try {
        // Ensure the main record exists
        let mainHistory = await prisma.patientMedicalHistory.upsert({
            where: { userId: session.user.id },
            create: { userId: session.user.id },
            update: {}
        });

        const updateData = {};

        switch (section) {
            case 'birth':
                updateData.birthHistory = {
                    upsert: {
                        create: {
                            birthTerm: data.birthTerm,
                            birthWeight: data.birthWeight,
                            deliveryType: data.deliveryType,
                            complications: data.complications,
                            motherHealthIssues: data.motherHealthIssues,
                            notes: data.notes,
                            birthCry: data.birthCry,
                            birthSkinColor: data.birthSkinColor,
                            birthStool: data.birthStool,
                            birthFeeding: data.birthFeeding,
                            birthSleep: data.birthSleep
                        },
                        update: {
                            birthTerm: data.birthTerm,
                            birthWeight: data.birthWeight,
                            deliveryType: data.deliveryType,
                            complications: data.complications,
                            motherHealthIssues: data.motherHealthIssues,
                            notes: data.notes,
                            birthCry: data.birthCry,
                            birthSkinColor: data.birthSkinColor,
                            birthStool: data.birthStool,
                            birthFeeding: data.birthFeeding,
                            birthSleep: data.birthSleep
                        }
                    }
                };
                break;
            case 'childhood':
                const { hospitalizations, ...childhoodFields } = data;
                updateData.childhoodHistory = {
                    upsert: {
                        create: {
                            ...childhoodFields,
                            hospitalizations: { create: hospitalizations || [] }
                        },
                        update: {
                            ...childhoodFields,
                            hospitalizations: {
                                deleteMany: {},
                                create: hospitalizations || []
                            }
                        }
                    }
                };
                break;
            case 'gender_female':
                const { pregnancies, ...femaleFields } = data;
                updateData.femaleHistory = {
                    upsert: {
                        create: {
                            ...femaleFields,
                            pregnancies: { create: pregnancies || [] }
                        },
                        update: {
                            ...femaleFields,
                            pregnancies: {
                                deleteMany: {},
                                create: pregnancies || []
                            }
                        }
                    }
                };
                break;
            case 'gender_male':
                updateData.maleHistory = {
                    upsert: {
                        create: data,
                        update: data
                    }
                };
                break;
            case 'family':
                const familyData = Array.isArray(data) ? data : (data.familyHistory || []);
                updateData.familyHistory = {
                    deleteMany: {},
                    create: familyData.map(f => ({
                        relation: f.relation,
                        conditions: f.conditions,
                        onsetAge: f.onsetAge,
                        relativeAge: f.relativeAge?.toString(), // Ensure string if DB expects it or Int? Schema check needed. 
                        // Plan said Int for relativeAge. Let's cast to int safe.
                        relativeAge: f.relativeAge ? parseInt(f.relativeAge) : null,
                        relativeDOB: f.relativeDOB ? new Date(f.relativeDOB) : null,
                        notes: f.notes
                    }))
                };
                break;
            case 'surgery':
                const surgeryList = data.surgery || []; // data.surgery comes from step
                updateData.surgeries = {
                    deleteMany: {},
                    create: surgeryList.map(s => ({
                        type: s.type,
                        year: s.year ? parseInt(s.year) : null,
                        surgeryDate: s.surgeryDate ? new Date(s.surgeryDate) : null,
                        complications: s.complications || s.notes, // fallback/combine
                        hospital: s.hospital,
                        surgeon: s.surgeon,
                        notes: s.notes,
                        imageUrl: s.imageUrl
                    }))
                };
                break;
            case 'allergy':
                const allergyList = data.allergy || [];
                updateData.allergies = {
                    deleteMany: {},
                    create: allergyList.map(a => ({
                        type: a.type,
                        allergen: a.allergen,
                        reaction: a.reaction,
                        severity: a.severity,
                        status: a.status,
                        onset: a.onset,
                        duration: a.duration,
                        medication: a.medication,
                        notes: a.notes,
                        imageUrl: a.imageUrl
                    }))
                };
                break;
            case 'accident':
                const accidentList = data.accident || [];
                updateData.accidents = {
                    deleteMany: {},
                    create: accidentList.map(a => ({
                        type: a.type,
                        year: a.year ? parseInt(a.year) : null,
                        accidentDate: a.accidentDate ? new Date(a.accidentDate) : null,
                        hospital: a.hospital,
                        treatment: a.treatment,
                        residualEffects: a.residualEffects,
                        injuries: {
                            create: (a.injuries || []).map(i => ({
                                bodyPart: i.bodyPart,
                                injuryType: i.injuryType
                            }))
                        }
                    }))
                };
                break;
            default:
                break;
        }

        if (completionStatus !== undefined) {
            updateData.completionStatus = completionStatus;
        }

        const updated = await prisma.patientMedicalHistory.update({
            where: { id: mainHistory.id },
            data: updateData,
            include: {
                birthHistory: true, // Return updated data
                childhoodHistory: true
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error saving medical history:", error);
        return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
    }
}
