// lowkey this handles all the location stuff for the exchange feature. dont touch it unless you know what youre doing

export interface GeoLocation {
    latitude: number;
    longitude: number;
    country?: string;
    locationLabel?: string;
}

// deadass calculating distance between two points using that goofy ahh haversine formula from math class
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // earths radius in km. dont @ me if this is wrong
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// n-not like i want to know where you are or anything... baka! uses browser geolocation api
export function getUserLocation(): Promise<GeoLocation> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser"));
            return;
        }

        // gotta check if we're in a secure context cause mobile browsers are lowkey strict about this
        if (typeof window !== 'undefined' && window.isSecureContext === false) {
            reject(new Error("Geolocation requires a secure connection (HTTPS)"));
            return;
        }

        // mobile browsers lowkenuinely need more time and might need high accuracy for initial fix
        const isMobile = typeof navigator !== 'undefined' && 
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                // bruh on mobile we try again with lower accuracy if high accuracy fails. its not perfect but whatever
                if (isMobile && error.code === error.TIMEOUT) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            resolve({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                            });
                        },
                        (retryError) => {
                            handleGeolocationError(retryError, reject);
                        },
                        {
                            enableHighAccuracy: false,
                            timeout: 15000,
                            maximumAge: 600000, // 10 min cache cause im not tryna spam the gps
                        }
                    );
                    return;
                }
                handleGeolocationError(error, reject);
            },
            {
                enableHighAccuracy: isMobile, // use high accuracy on mobile for better results i guess
                timeout: isMobile ? 20000 : 10000, // give mobile more time cause theyre slow
                maximumAge: 300000, // cache for 5 minutes, not that you asked
            }
        );
    });
}

function handleGeolocationError(error: GeolocationPositionError, reject: (reason: Error) => void) {
    switch (error.code) {
    case error.PERMISSION_DENIED:
        reject(new Error("Location permission denied. Please enable location access in your browser settings."));
        break;
    case error.POSITION_UNAVAILABLE:
        reject(new Error("Location unavailable. Please ensure GPS/Location Services are enabled."));
        break;
    case error.TIMEOUT:
        reject(new Error("Location request timed out. Please try again or check your connection."));
        break;
    default:
        reject(new Error("Unable to get location. Please try again."));
    }
}

// ima get slimed for ts but we're using a simple approach to reverse geocode and get country from coords
export async function getCountryFromCoords(
    latitude: number,
    longitude: number
): Promise<string> {
    try {
        // using openstreetmap api for reverse geocoding cause google maps costs money bruh
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        );
        
        if (response.ok) {
            const data = await response.json();
            return data.address?.country_code?.toUpperCase() || "QA";
        }
    } catch {
        console.error("Failed to reverse geocode");
    }
    return "QA"; // fallback to qatar cause why not lol
}

// lowkey gets a detailed location label from coords. i-its not like i worked hard on this or anything
async function getLocationLabel(
    latitude: number,
    longitude: number
): Promise<string> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        );
        
        if (response.ok) {
            const data = await response.json();
            const address = data.address;
            if (address) {
                // Build a detailed location string
                const parts: string[] = [];
                
                // add neighborhood/suburb
                if (address.neighbourhood) parts.push(address.neighbourhood);
                else if (address.suburb) parts.push(address.suburb);
                
                // add city/town/village whatever
                if (address.city) parts.push(address.city);
                else if (address.town) parts.push(address.town);
                else if (address.village) parts.push(address.village);
                else if (address.municipality) parts.push(address.municipality);
                
                // add state/region i guess
                if (address.state) parts.push(address.state);
                else if (address.region) parts.push(address.region);
                
                // add country obviously
                if (address.country) parts.push(address.country);
                
                if (parts.length > 0) {
                    return parts.join(", ");
                }
            }
            // fallback to display_name if everything else is bussin
            if (data.display_name) {
                // truncate if too long cause nobody wants to read all that
                const displayName = data.display_name;
                if (displayName.length > 60) {
                    return displayName.substring(0, 57) + "...";
                }
                return displayName;
            }
        }
    } catch {
        console.error("Failed to get location label");
    }
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

// currency symbols by country code. deadass had to look all these up
export const CURRENCY_BY_COUNTRY: Record<string, { code: string; symbol: string }> = {
    US: { code: "USD", symbol: "$" },
    GB: { code: "GBP", symbol: "£" },
    EU: { code: "EUR", symbol: "€" },
    DE: { code: "EUR", symbol: "€" },
    FR: { code: "EUR", symbol: "€" },
    ES: { code: "EUR", symbol: "€" },
    IT: { code: "EUR", symbol: "€" },
    JP: { code: "JPY", symbol: "¥" },
    CN: { code: "CNY", symbol: "¥" },
    IN: { code: "INR", symbol: "₹" },
    BR: { code: "BRL", symbol: "R$" },
    CA: { code: "CAD", symbol: "C$" },
    AU: { code: "AUD", symbol: "A$" },
    MX: { code: "MXN", symbol: "$" },
    KR: { code: "KRW", symbol: "₩" },
    RU: { code: "RUB", symbol: "₽" },
    ZA: { code: "ZAR", symbol: "R" },
    NG: { code: "NGN", symbol: "₦" },
    EG: { code: "EGP", symbol: "E£" },
    KE: { code: "KES", symbol: "KSh" },
    PH: { code: "PHP", symbol: "₱" },
    ID: { code: "IDR", symbol: "Rp" },
    TH: { code: "THB", symbol: "฿" },
    VN: { code: "VND", symbol: "₫" },
    PK: { code: "PKR", symbol: "Rs" },
    BD: { code: "BDT", symbol: "৳" },
    TR: { code: "TRY", symbol: "₺" },
    SA: { code: "SAR", symbol: "﷼" },
    AE: { code: "AED", symbol: "د.إ" },
    IL: { code: "ILS", symbol: "₪" },
    PL: { code: "PLN", symbol: "zł" },
    SE: { code: "SEK", symbol: "kr" },
    NO: { code: "NOK", symbol: "kr" },
    DK: { code: "DKK", symbol: "kr" },
    CH: { code: "CHF", symbol: "CHF" },
    NZ: { code: "NZD", symbol: "NZ$" },
    SG: { code: "SGD", symbol: "S$" },
    HK: { code: "HKD", symbol: "HK$" },
    TW: { code: "TWD", symbol: "NT$" },
    MY: { code: "MYR", symbol: "RM" },
    CL: { code: "CLP", symbol: "$" },
    CO: { code: "COP", symbol: "$" },
    AR: { code: "ARS", symbol: "$" },
    PE: { code: "PEN", symbol: "S/" },
};

export function getCurrencyForCountry(countryCode: string): { code: string; symbol: string } {
    return CURRENCY_BY_COUNTRY[countryCode] || { code: "USD", symbol: "$" };
}

export function formatPrice(amount: number, countryCode: string): string {
    const currency = getCurrencyForCountry(countryCode);
    return `${currency.symbol}${amount.toFixed(2)}`;
}

// country names for display. ts pmo having to type all of these
export const COUNTRY_NAMES: Record<string, string> = {
    QA: "Qatar",
    SD: "Sudan",
    SY: "Syria",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    ES: "Spain",
    IT: "Italy",
    JP: "Japan",
    CN: "China",
    IN: "India",
    BR: "Brazil",
    MX: "Mexico",
    KR: "South Korea",
    RU: "Russia",
    ZA: "South Africa",
    NG: "Nigeria",
    EG: "Egypt",
    KE: "Kenya",
    PH: "Philippines",
    ID: "Indonesia",
    TH: "Thailand",
    VN: "Vietnam",
    PK: "Pakistan",
    BD: "Bangladesh",
    TR: "Turkey",
    SA: "Saudi Arabia",
    AE: "UAE",
    IL: "Palestine", // bruh ima get slimed for ts but we changed it to palestine
    PS: "Palestine", // same here dont @ me
    PL: "Poland",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    CH: "Switzerland",
    NZ: "New Zealand",
    SG: "Singapore",
    HK: "Hong Kong",
    TW: "Taiwan",
    MY: "Malaysia",
    CL: "Chile",
    CO: "Colombia",
    AR: "Argentina",
    PE: "Peru",
};

export function getCountryName(countryCode: string): string {
    return COUNTRY_NAMES[countryCode] || countryCode;
}

// max distance for listing visibility in km. lowkey might need to adjust this later
export const MAX_LISTING_DISTANCE_KM = 50;
