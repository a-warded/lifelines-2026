"use client";

import {
    Badge,
    Button,
    Card,
    CardContent,
    Input,
    Modal,
    OfflineBadge,
    Select,
    Textarea,
} from "@/components/ui";
import {
    ArrowLeft,
    Filter,
    Leaf,
    Loader2,
    MapPin,
    Package,
    Phone,
    Plus,
    Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Listing {
  id: string;
  userId: string;
  type: "seed" | "surplus" | "tool";
  title: string;
  description: string;
  quantity: number;
  unit: string;
  condition?: "fresh" | "unknown" | "old";
  locationArea: string;
  contact: string;
  status: "open" | "claimed" | "completed" | "cancelled";
  createdAt: string;
  isOwner: boolean;
}

type ListingType = "all" | "seed" | "surplus" | "tool";
type StatusFilter = "all" | "open" | "claimed" | "completed";

export default function ExchangePage() {
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<ListingType>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");

    // Create listing modal
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Claim modal
    const [claimModal, setClaimModal] = useState<{
    listing: Listing | null;
    name: string;
    contact: string;
    loading: boolean;
  }>({ listing: null, name: "", contact: "", loading: false });

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter !== "all") params.set("type", typeFilter);
            if (statusFilter !== "all") params.set("status", statusFilter);

            const res = await fetch(`/api/exchange?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setListings(data.listings);
            }
        } catch (error) {
            console.error("Failed to fetch listings:", error);
        } finally {
            setLoading(false);
        }
    }, [typeFilter, statusFilter]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const handleClaim = async () => {
        if (!claimModal.listing || !claimModal.name || !claimModal.contact) return;

        setClaimModal((prev) => ({ ...prev, loading: true }));
        try {
            const res = await fetch("/api/exchange/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listingId: claimModal.listing.id,
                    claimerName: claimModal.name,
                    claimerContact: claimModal.contact,
                }),
            });

            if (res.ok) {
                setClaimModal({ listing: null, name: "", contact: "", loading: false });
                fetchListings();
            }
        } catch (error) {
            console.error("Claim failed:", error);
        } finally {
            setClaimModal((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleUpdateStatus = async (listingId: string, action: string) => {
        try {
            const res = await fetch("/api/exchange", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId, action }),
            });

            if (res.ok) {
                fetchListings();
            }
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const typeIcons = {
        seed: Leaf,
        surplus: Package,
        tool: Wrench,
    };

    const typeColors = {
        seed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        surplus: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
        tool: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    };

    const statusVariants = {
        open: "success",
        claimed: "warning",
        completed: "secondary",
        cancelled: "outline",
    } as const;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
              Community Exchange
                        </h1>
                        <p className="text-sm text-muted-foreground">
              Share seeds, surplus produce, and tools with neighbors
                        </p>
                    </div>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
          Create Listing
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {(["all", "seed", "surplus", "tool"] as const).map((type) => (
                        <Button
                            key={type}
                            variant={typeFilter === type ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setTypeFilter(type)}
                        >
                            {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                    ))}
                </div>
                <div className="sm:ml-auto">
                    <Select
                        options={[
                            { value: "open", label: "Open" },
                            { value: "claimed", label: "Claimed" },
                            { value: "completed", label: "Completed" },
                            { value: "all", label: "All Status" },
                        ]}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    />
                </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : listings.length === 0 ? (
                <Card className="py-12 text-center">
                    <CardContent>
                        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Listings Found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
              Be the first to share something with your community!
                        </p>
                        <Button onClick={() => setShowCreateModal(true)} className="mt-4">
              Create First Listing
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => {
                        const Icon = typeIcons[listing.type];
                        return (
                            <Card key={listing.id} className="flex flex-col">
                                <CardContent className="flex flex-1 flex-col">
                                    {/* Type & Status */}
                                    <div className="mb-3 flex items-center justify-between">
                                        <div
                                            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${typeColors[listing.type]}`}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                            {listing.type}
                                        </div>
                                        <Badge variant={statusVariants[listing.status]}>
                                            {listing.status}
                                        </Badge>
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="font-semibold">{listing.title}</h3>
                                    {listing.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                            {listing.description}
                                        </p>
                                    )}

                                    {/* Details */}
                                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                                        <Badge variant="outline">
                                            {listing.quantity} {listing.unit}
                                        </Badge>
                                        {listing.condition && listing.type === "seed" && (
                                            <Badge variant="outline">{listing.condition}</Badge>
                                        )}
                                    </div>

                                    {/* Location */}
                                    <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        {listing.locationArea}
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex gap-2 pt-2 border-t">
                                        {listing.isOwner ? (
                                            <>
                                                {listing.status === "claimed" && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() =>
                                                            handleUpdateStatus(listing.id, "complete")
                                                        }
                                                    >
                            Mark Complete
                                                    </Button>
                                                )}
                                                {(listing.status === "open" ||
                          listing.status === "claimed") && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleUpdateStatus(listing.id, "cancel")
                                                        }
                                                    >
                            Cancel
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            listing.status === "open" && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() =>
                                                        setClaimModal({
                                                            listing,
                                                            name: "",
                                                            contact: "",
                                                            loading: false,
                                                        })
                                                    }
                                                >
                          Claim This
                                                </Button>
                                            )
                                        )}
                                    </div>

                                    {/* Time */}
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {new Date(listing.createdAt).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create Listing Modal */}
            <CreateListingModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchListings();
                }}
            />

            {/* Claim Modal */}
            <Modal
                isOpen={!!claimModal.listing}
                onClose={() =>
                    setClaimModal({ listing: null, name: "", contact: "", loading: false })
                }
                title="Claim This Item"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
            Provide your contact info so the owner can reach you.
                    </p>
                    <Input
                        label="Your Name"
                        value={claimModal.name}
                        onChange={(e) =>
                            setClaimModal((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Enter your name"
                    />
                    <Input
                        label="Contact Info"
                        value={claimModal.contact}
                        onChange={(e) =>
                            setClaimModal((prev) => ({ ...prev, contact: e.target.value }))
                        }
                        placeholder="Phone, Telegram, or Email"
                        helper="How should the owner contact you?"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setClaimModal({
                                    listing: null,
                                    name: "",
                                    contact: "",
                                    loading: false,
                                })
                            }
                        >
              Cancel
                        </Button>
                        <Button
                            onClick={handleClaim}
                            loading={claimModal.loading}
                            disabled={!claimModal.name || !claimModal.contact}
                        >
                            <Phone className="mr-2 h-4 w-4" />
              Submit Claim
                        </Button>
                    </div>
                </div>
            </Modal>

            <OfflineBadge />
        </div>
    );
}

// Create Listing Modal Component
function CreateListingModal({
    isOpen,
    onClose,
    onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        type: "seed" as "seed" | "surplus" | "tool",
        title: "",
        description: "",
        quantity: 1,
        unit: "items",
        condition: "unknown" as "fresh" | "unknown" | "old",
        locationArea: "",
        contact: "",
    });

    const handleChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (formData.quantity <= 0)
            newErrors.quantity = "Quantity must be greater than 0";
        if (!formData.locationArea.trim())
            newErrors.locationArea = "Location is required";
        if (!formData.contact.trim()) newErrors.contact = "Contact info is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/exchange", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSuccess();
                setFormData({
                    type: "seed",
                    title: "",
                    description: "",
                    quantity: 1,
                    unit: "items",
                    condition: "unknown",
                    locationArea: "",
                    contact: "",
                });
            }
        } catch (error) {
            console.error("Create listing failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Listing" size="md">
            <div className="space-y-4">
                <Select
                    label="Type"
                    options={[
                        { value: "seed", label: "Seeds" },
                        { value: "surplus", label: "Surplus Produce" },
                        { value: "tool", label: "Tools / Supplies" },
                    ]}
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                />

                <Input
                    label="Title *"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="What are you sharing?"
                    error={errors.title}
                />

                <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Any details about the item..."
                    rows={3}
                    helper="Max 500 characters"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Quantity *"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                        min={1}
                        error={errors.quantity}
                    />
                    <Select
                        label="Unit"
                        options={[
                            { value: "items", label: "Items" },
                            { value: "packets", label: "Packets" },
                            { value: "seeds", label: "Seeds" },
                            { value: "kg", label: "Kilograms" },
                            { value: "pieces", label: "Pieces" },
                        ]}
                        value={formData.unit}
                        onChange={(e) => handleChange("unit", e.target.value)}
                    />
                </div>

                {formData.type === "seed" && (
                    <Select
                        label="Seed Condition"
                        options={[
                            { value: "fresh", label: "Fresh - This season" },
                            { value: "unknown", label: "Unknown" },
                            { value: "old", label: "Old - Over 1 year" },
                        ]}
                        value={formData.condition}
                        onChange={(e) => handleChange("condition", e.target.value)}
                    />
                )}

                <Input
                    label="Location Area *"
                    value={formData.locationArea}
                    onChange={(e) => handleChange("locationArea", e.target.value)}
                    placeholder="e.g., City Center, North Zone"
                    helper="Use general area only (no exact address)"
                    error={errors.locationArea}
                />

                <Input
                    label="Contact Method *"
                    value={formData.contact}
                    onChange={(e) => handleChange("contact", e.target.value)}
                    placeholder="Phone, Telegram, Email, etc."
                    error={errors.contact}
                />

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
            Cancel
                    </Button>
                    <Button onClick={handleSubmit} loading={loading}>
                        <Plus className="mr-2 h-4 w-4" />
            Create Listing
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
