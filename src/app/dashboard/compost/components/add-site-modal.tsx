"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationPickerMap } from "@/components/onboarding/location-picker-map";
import { MapPin, Plus } from "lucide-react";
import type { AddSiteForm, CompostLocation, TranslateFunction } from "../types";
import { SITE_TYPE_OPTIONS } from "../constants";

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: AddSiteForm;
  updateForm: <K extends keyof AddSiteForm>(key: K, value: AddSiteForm[K]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  userLocation: CompostLocation | null;
  onLocationChange: (lat: number, lng: number, label?: string) => void;
  locationLabel: string;
  t: TranslateFunction;
}

export function AddSiteModal({
  isOpen,
  onClose,
  form,
  updateForm,
  onSubmit,
  isSubmitting,
  userLocation,
  onLocationChange,
  locationLabel,
  t,
}: AddSiteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("compost.addSiteModal.title", "Add Composting Site")}
    >
      <div className="space-y-4">
        {/* Site Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("compost.addSiteModal.siteName", "Site Name")} *
          </label>
          <Input
            value={form.siteName}
            onChange={(e) => updateForm("siteName", e.target.value)}
            placeholder={t(
              "compost.addSiteModal.siteNamePlaceholder",
              "e.g., Community Garden Compost"
            )}
          />
        </div>

        {/* Site Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("compost.addSiteModal.siteType", "Site Type")} *
          </label>
          <Select
            value={form.siteType}
            onChange={(e) =>
              updateForm("siteType", e.target.value as AddSiteForm["siteType"])
            }
            options={SITE_TYPE_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("compost.addSiteModal.description", "Description")}
          </label>
          <Textarea
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            placeholder={t(
              "compost.addSiteModal.descriptionPlaceholder",
              "What kind of waste do you accept? Any special instructions?"
            )}
            rows={2}
          />
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.acceptsWaste}
              onChange={(e) => updateForm("acceptsWaste", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">
              {t("compost.addSiteModal.acceptsWaste", "Accept waste from others")}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.sellsFertilizer}
              onChange={(e) => updateForm("sellsFertilizer", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">
              {t("compost.addSiteModal.sellsFertilizer", "Have fertilizer available")}
            </span>
          </label>
        </div>

        {/* Capacity */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("compost.addSiteModal.capacity", "Capacity (kg)")}
          </label>
          <Input
            type="number"
            value={form.capacityKg}
            onChange={(e) => updateForm("capacityKg", e.target.value)}
            placeholder={t("compost.addSiteModal.capacityPlaceholder", "e.g., 500")}
          />
        </div>

        {/* Contact Info */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {t("compost.addSiteModal.contact", "Contact Info")}
          </label>
          <Input
            value={form.contactInfo}
            onChange={(e) => updateForm("contactInfo", e.target.value)}
            placeholder={t(
              "compost.addSiteModal.contactPlaceholder",
              "Phone or email (optional)"
            )}
          />
        </div>

        {/* Location Section with Mini Map */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            {t("compost.addSiteModal.location", "Location")} *
          </label>
          <p className="text-xs text-muted-foreground">
            Click on the map to set the composting site location
          </p>

          <div className="rounded-lg overflow-hidden border border-border">
            <LocationPickerMap
              latitude={userLocation?.lat}
              longitude={userLocation?.lng}
              onLocationSelect={onLocationChange}
              height="200px"
            />
          </div>

          {userLocation && (
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground text-xs truncate">
                {locationLabel ||
                  `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!form.siteName || !userLocation || isSubmitting}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {t("compost.addSiteModal.submit", "Add Site")}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
