import { useState } from 'react';
import '../styles/CountrySelector.css';
import { useGameStore } from '../store/GameStore';

const CountrySelector = () => {

    const countries = useGameStore((state) => state.empires);
    const players = useGameStore((state) => state.players);
    const localPlayerId = useGameStore((state) => state.localPlayerId);
    const setPlayerCountry = useGameStore((state) => state.setPlayerCountry);

    const controller = useGameStore.getState();

    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    const filteredCountries = searchValue === "" ? Object.values(countries) : Object.values(countries).filter(
        c => c.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const availableCountries = filteredCountries.filter(c => 
        !players.some(p => p.countryId === c.id && p.id !== localPlayerId)
    );

    const handleSelectCountry = (countryId: string) => {
        if (localPlayerId) {
            setPlayerCountry(localPlayerId, countryId);
        }
        const countryName = countries[countryId]?.name || "";
        setSelectedCountry(countryName);
        setSearchValue(countryName);
        setIsDropdownOpen(false);
    };

    return (
        <div className="country-selector-container">
            <div className="cs-header">
                <div className="cs-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6082B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                </div>
                <h2>Select Country</h2>
            </div>

            <div className="cs-search-box">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchValue}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                        setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setIsDropdownOpen(false)}
                />

                {isDropdownOpen && availableCountries.length > 0 && (
                    <ul className="cs-dropdown">
                        {availableCountries.map((country) => (
                            <li
                                key={country.id}
                                className="cs-dropdown-item"
                                onMouseDown={() => handleSelectCountry(country.id)}
                            >
                                <span
                                    className="cs-dropdown-color"
                                    style={{ backgroundColor: country.color || '#fff' }}
                                ></span>
                                {country.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="cs-current-region">
                <div className="cs-watermark">
                    {selectedCountry ? selectedCountry.substring(0, 2).toUpperCase() : "US"}
                </div>
                <div className="cs-region-info">
                    <span className="cs-label">Current Country</span>
                    <span className="cs-value">{selectedCountry ? selectedCountry : "None"}</span>
                </div>
            </div>
        </div>
    );
};

export default CountrySelector;
