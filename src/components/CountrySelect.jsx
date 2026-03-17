import Select from "react-select";

const COUNTRIES = [
  { value: "AF", label: "🇦🇫 Afghanistan" },
  { value: "AL", label: "🇦🇱 Albania" },
  { value: "DZ", label: "🇩🇿 Algeria" },
  { value: "AR", label: "🇦🇷 Argentina" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "AT", label: "🇦🇹 Austria" },
  { value: "BE", label: "🇧🇪 Belgium" },
  { value: "BR", label: "🇧🇷 Brazil" },
  { value: "CA", label: "🇨🇦 Canada" },
  { value: "CL", label: "🇨🇱 Chile" },
  { value: "CN", label: "🇨🇳 China" },
  { value: "CO", label: "🇨🇴 Colombia" },
  { value: "HR", label: "🇭🇷 Croatia" },
  { value: "CZ", label: "🇨🇿 Czech Republic" },
  { value: "DK", label: "🇩🇰 Denmark" },
  { value: "EG", label: "🇪🇬 Egypt" },
  { value: "FI", label: "🇫🇮 Finland" },
  { value: "FR", label: "🇫🇷 France" },
  { value: "DE", label: "🇩🇪 Germany" },
  { value: "GH", label: "🇬🇭 Ghana" },
  { value: "GR", label: "🇬🇷 Greece" },
  { value: "HK", label: "🇭🇰 Hong Kong" },
  { value: "HU", label: "🇭🇺 Hungary" },
  { value: "IN", label: "🇮🇳 India" },
  { value: "ID", label: "🇮🇩 Indonesia" },
  { value: "IE", label: "🇮🇪 Ireland" },
  { value: "IL", label: "🇮🇱 Israel" },
  { value: "IT", label: "🇮🇹 Italy" },
  { value: "JP", label: "🇯🇵 Japan" },
  { value: "JO", label: "🇯🇴 Jordan" },
  { value: "KE", label: "🇰🇪 Kenya" },
  { value: "KW", label: "🇰🇼 Kuwait" },
  { value: "LB", label: "🇱🇧 Lebanon" },
  { value: "MY", label: "🇲🇾 Malaysia" },
  { value: "MX", label: "🇲🇽 Mexico" },
  { value: "MA", label: "🇲🇦 Morocco" },
  { value: "NL", label: "🇳🇱 Netherlands" },
  { value: "NZ", label: "🇳🇿 New Zealand" },
  { value: "NG", label: "🇳🇬 Nigeria" },
  { value: "NO", label: "🇳🇴 Norway" },
  { value: "PK", label: "🇵🇰 Pakistan" },
  { value: "PE", label: "🇵🇪 Peru" },
  { value: "PH", label: "🇵🇭 Philippines" },
  { value: "PL", label: "🇵🇱 Poland" },
  { value: "PT", label: "🇵🇹 Portugal" },
  { value: "QA", label: "🇶🇦 Qatar" },
  { value: "RO", label: "🇷🇴 Romania" },
  { value: "SA", label: "🇸🇦 Saudi Arabia" },
  { value: "SG", label: "🇸🇬 Singapore" },
  { value: "ZA", label: "🇿🇦 South Africa" },
  { value: "KR", label: "🇰🇷 South Korea" },
  { value: "ES", label: "🇪🇸 Spain" },
  { value: "SE", label: "🇸🇪 Sweden" },
  { value: "CH", label: "🇨🇭 Switzerland" },
  { value: "TW", label: "🇹🇼 Taiwan" },
  { value: "TH", label: "🇹🇭 Thailand" },
  { value: "TR", label: "🇹🇷 Turkey" },
  { value: "AE", label: "🇦🇪 UAE" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "US", label: "🇺🇸 United States" },
  { value: "VN", label: "🇻🇳 Vietnam" },
];

// matchBy: "code" (default) matches on value e.g. "GB"
//          "name" matches on label text e.g. "United Kingdom" (for Google Autocomplete)
export default function CountrySelect({
  value,
  onChange,
  required,
  matchBy = "code",
}) {
  const selected =
    matchBy === "name"
      ? COUNTRIES.find((c) =>
          c.label.toLowerCase().includes(value?.toLowerCase())
        ) || null
      : COUNTRIES.find((c) => c.value === value) || null;

  return (
    <Select
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: "transparent",
          height: "50px",
          borderRadius: "0.375rem",
          borderColor: state.isFocused
            ? "#305CDE"
            : "oklch(87.2% 0.01 258.338)",
          boxShadow: state.isFocused ? "0 0 0 2px #305CDE" : "none",
          "&:hover": { borderColor: "#305CDE" },
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#305CDE"
            : state.isFocused
            ? "#f0f0f0"
            : "white",
          color: state.isSelected ? "white" : "#305CDE",
        }),
        placeholder: (base) => ({
          ...base,
          color: "#9ca3af",
        }),
      }}
      options={COUNTRIES}
      placeholder="Country"
      required={required}
      value={selected}
      onChange={(selected) =>
        onChange({
          target: {
            name: "location.country",
            value: selected?.value ?? "",
          },
        })
      }
    />
  );
}
