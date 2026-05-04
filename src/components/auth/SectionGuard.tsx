import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "../../redux/store";
import { setCurrentSection } from "../../redux/slices/uiSlice";
import SectionLoading from "../ui/SectionLoading";

interface SectionGuardProps {
    children: React.ReactNode;
    section: "admin" | "client";
}

const SectionGuard: React.FC<SectionGuardProps> = ({ children, section }) => {
    const dispatch = useDispatch();
    const { currentSection } = useSelector((state: RootState) => state.ui);
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        // Show loading if we are entering a new base section (manual entry or switch via button)
        if (currentSection !== section) {
            setShowLoading(true);
            const timer = setTimeout(() => {
                setShowLoading(false);
                dispatch(setCurrentSection(section));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [section, currentSection, dispatch]);

    if (showLoading) {
        return <SectionLoading type={section} />;
    }

    return <>{children}</>;
};

export default SectionGuard;
