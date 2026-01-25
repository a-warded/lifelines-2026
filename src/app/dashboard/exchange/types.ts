// Exchange feature type definitions
import type { TFunction } from "i18next";

export type TranslateFunction = TFunction<"translation", undefined>;

export interface Listing {
  id: string;
  userId: string;
  userName?: string;
  type: ListingType;
  plantId?: string;
  title: string;
  description: string;
  quantity?: string;
  mode: ListingMode;
  dealType: DealType;
  price?: number;
  currencyCountry?: string;
  tradeItems?: string[];
  deliveryMethod?: DeliveryMethod;
  country: string;
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
  distance?: number;
  status: ListingStatus;
  createdAt: string;
  isOwner: boolean;
  claimCount?: number;
}

export type ListingType = "seeds" | "produce" | "tools" | "fertilizer" | "other";
export type ListingMode = "offering" | "seeking";
export type DealType = "price" | "trade" | "donation";
export type DeliveryMethod = 
  | "pickup" 
  | "walking" 
  | "bicycle" 
  | "car" 
  | "truck" 
  | "boat" 
  | "drone" 
  | "helicopter" 
  | "airdrop";
export type ListingStatus = "available" | "claimed" | "completed" | "cancelled";

export interface CreateListingForm {
  mode: ListingMode;
  type: ListingType;
  plantId: string;
  title: string;
  description: string;
  quantity: string;
  dealType: DealType;
  price: string;
  tradeItems: string[];
  newTradeItem: string;
  deliveryMethod: DeliveryMethod;
}

export interface ExchangeFilters {
  type: string;
  status: string;
  mode: string;
  delivery: string;
  searchQuery: string;
}

export interface DeliveryMethodOption {
  value: DeliveryMethod;
  label: string;
  emoji: string;
}
