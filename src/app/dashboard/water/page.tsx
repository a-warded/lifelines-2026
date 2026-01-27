"use client";

import { getPlantOptions } from "@/lib/plants";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

// components - the ui elements
import {
  PlantEntryForm,
  WaterHistoryCard,
  WaterResults,
  WaterTips,
} from "./components";

// hooks - hydration state management
import { useWaterCalculator, useWaterHistory } from "./hooks";

export default function WaterCalculatorPage() {
    const { t } = useTranslation();
    const plantOptions = useMemo(() => getPlantOptions(), []);

    // calculator state and logic. the water math
    const calculator = useWaterCalculator();

    // history management. keeping receipts of your hydration
    const { history, saveCalculation } = useWaterHistory();

    const handleSave = () => {
        if (calculator.result) {
            saveCalculation(calculator.result);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-2xl font-bold">{t("water.title", "Water Calculator")}</h1>
                <p className="text-muted-foreground mt-1">
                    {t("water.subtitle", "Calculate daily water needs for your plants")}
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - Plant entries */}
                <div className="space-y-4">
                    <PlantEntryForm
                        entries={calculator.entries}
                        plantOptions={plantOptions}
                        onAddEntry={calculator.addEntry}
                        onRemoveEntry={calculator.removeEntry}
                        onUpdateEntry={calculator.updateEntry}
                        onSave={handleSave}
                        onClear={calculator.clearAll}
                        hasResult={!!calculator.result}
                        t={t}
                    />
                </div>

                {/* Right column - Results */}
                <div className="space-y-4">
                    <WaterResults result={calculator.result} t={t} />

                    {calculator.result && calculator.result.tips.length > 0 && (
                        <WaterTips tips={calculator.result.tips} t={t} />
                    )}

                    <WaterHistoryCard history={history} t={t} />
                </div>
            </div>
        </div>
    );
}
