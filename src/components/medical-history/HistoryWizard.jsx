'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from './ProgressBar';
import BirthHistoryStep from './steps/BirthHistoryStep';
import ChildhoodHistoryStep from './steps/ChildhoodHistoryStep';
import GenderSpecificStep from './steps/GenderSpecificStep';
import FamilyHistoryStep from './steps/FamilyHistoryStep';
import SurgicalHistoryStep from './steps/SurgicalHistoryStep';
import AllergyHistoryStep from './steps/AllergyHistoryStep';
import AccidentHistoryStep from './steps/AccidentHistoryStep';
import ReviewStep from './steps/ReviewStep';
import './HistoryWizard.css';

const STEPS = [
    { id: 'birth', title: 'Birth History' },
    { id: 'childhood', title: 'Childhood' },
    { id: 'gender', title: 'Start' }, // Title changes dynamic
    { id: 'family', title: 'Family Tree' },
    { id: 'surgery', title: 'Surgeries' },
    { id: 'allergy', title: 'Allergies' },
    { id: 'accident', title: 'Accidents' },
    { id: 'review', title: 'Review' }
];

const HistoryWizard = ({ initialData, userGender }) => {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [historyData, setHistoryData] = useState(initialData || {});
    // If gender is missing in profile, we might need to ask or default. 
    // For now assume passed from server or user profile.

    const [isSaving, setIsSaving] = useState(false);

    const currentStep = STEPS[currentStepIndex];
    const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

    const handleNext = async (stepData) => {
        // Update local state
        const updatedData = { ...historyData, ...stepData };
        setHistoryData(updatedData);

        // Save progress to DB (Auto-save)
        try {
            setIsSaving(true);
            await fetch('/api/medical-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: currentStep.id,
                    data: stepData, // Save only current section data or full? API handles section-specific
                    completionStatus: progress
                })
            });
        } catch (error) {
            console.error("Auto-save failed", error);
        } finally {
            setIsSaving(false);
        }

        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            // Final submit or redirect
            router.push('/history');
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const renderStep = () => {
        const props = {
            onNext: handleNext,
            onBack: handleBack,
            data: historyData, // Pass full data to allow cross-checking if needed
            isSaving
        };

        switch (currentStep.id) {
            case 'birth': return <BirthHistoryStep {...props} />;
            case 'childhood': return <ChildhoodHistoryStep {...props} />;
            case 'gender': return <GenderSpecificStep {...props} userGender={userGender} />;
            case 'family': return <FamilyHistoryStep {...props} />;
            case 'surgery': return <SurgicalHistoryStep {...props} />;
            case 'allergy': return <AllergyHistoryStep {...props} />;
            case 'accident': return <AccidentHistoryStep {...props} />;
            case 'review': return <ReviewStep {...props} />;
            default: return <div>Unknown Step</div>;
        }
    };

    return (
        <div className="wizard-container">
            <ProgressBar progress={progress} stepTitle={STEPS[currentStepIndex].title} />

            <div className="wizard-content">
                {renderStep()}
            </div>
        </div>
    );
};

export default HistoryWizard;
