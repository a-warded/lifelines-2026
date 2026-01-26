"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

// Components
import {
    WasteCalculator,
    CompostResults,
    NearbySites,
    AddSiteModal,
    SidebarCards,
} from "./components";

// Hooks
import {
    useCompostCalculator,
    useCompostSites,
    useAddSite,
} from "./hooks";

export default function CompostPage() {
    const { t } = useTranslation();
    const [showAddSiteModal, setShowAddSiteModal] = useState(false);

    // Calculator state and logic
    const calculator = useCompostCalculator();

    // Nearby sites
    const sites = useCompostSites();

    // Add site form
    const addSiteHandler = useAddSite({
        userLocation: sites.userLocation,
        locationLabel: sites.locationLabel,
        onSuccess: () => {
            setShowAddSiteModal(false);
            sites.refetch();
        },
    });

    // Handle location change from map picker
    const handleLocationChange = useCallback(
        (lat: number, lng: number, label?: string) => {
            sites.setUserLocation({ lat, lng });
            if (label) {
                sites.setLocationLabel(label);
            }
        },
        [sites]
    );

    return (
        <div className="container mx-auto max-w-6xl space-y-6 p-4 md:p-6">
            {/* Hero Section - Direct and opinionated */}
            <header className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {t("compost.title", "Compost Calculator")}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t(
                        "compost.subtitle",
                        "Most farms throw away usable fertilizer. Find out how much you're losing."
                    )}
                </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
                {/* Main Content */}
                <main className="space-y-6">
                    {/* Waste Entry Form */}
                    <WasteCalculator
                        entries={calculator.entries}
                        wasteTypeOptions={calculator.wasteTypeOptions}
                        onAddEntry={calculator.addEntry}
                        onRemoveEntry={calculator.removeEntry}
                        onUpdateEntry={calculator.updateEntry}
                        t={t}
                    />

                    {/* Results */}
                    {calculator.result && (
                        <CompostResults
                            result={calculator.result}
                            method={calculator.method}
                            valueEstimate={calculator.valueEstimate}
                            entries={calculator.entries}
                            t={t}
                        />
                    )}
                </main>

                {/* Sidebar */}
                <aside className="space-y-4">
                    {/* Nearby Composting Sites */}
                    <NearbySites
                        sites={sites.sites}
                        loading={sites.loading}
                        onAddSite={() => setShowAddSiteModal(true)}
                        t={t}
                    />

                    {/* Info Cards */}
                    <SidebarCards t={t} />
                </aside>
            </div>

            {/* Add Site Modal */}
            <AddSiteModal
                isOpen={showAddSiteModal}
                onClose={() => setShowAddSiteModal(false)}
                form={addSiteHandler.form}
                updateForm={addSiteHandler.updateForm}
                onSubmit={addSiteHandler.submitSite}
                isSubmitting={addSiteHandler.isSubmitting}
                userLocation={sites.userLocation}
                onLocationChange={handleLocationChange}
                locationLabel={sites.locationLabel}
                t={t}
            />
        </div>
    );
}
