export default {
    // Target countries and major cities
    countries: {
        'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh', 'Hurghada'],
        'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'],
        'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
        'Algeria': ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida'],
        'Iraq': ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Najaf'],
        'Sudan': ['Khartoum', 'Omdurman', 'Port Sudan', 'Kassala', 'Nyala'],
        'Yemen': ['Sanaa', 'Aden', 'Taiz', 'Hodeidah', 'Ibb']
    },

    // Search keywords for real estate
    keywords: [
        'real estate developer',
        'real estate broker',
        'real estate agent',
        'property developer',
        'real estate agency',
        'property broker'
    ],

    // Scraping settings
    scraping: {
        maxResultsPerSearch: 20,        // Max results per keyword/city
        delayBetweenSearches: 10000,    // 10 seconds between searches
        delayBetweenClicks: 3000,       // 3 seconds between clicks
        scrollDelay: 2000,              // 2 seconds between scrolls
        maxScrolls: 10,                 // Max scrolls to load more results
        batchSize: 50,                  // Save every 50 results
        sessionLimit: 100,              // Max businesses per session
        dailyLimit: 300                 // Max businesses per day
    },

    // Safety settings
    safety: {
        requireVPN: true,               // Require VPN before starting
        randomDelayMin: 5000,           // Min random delay (5 sec)
        randomDelayMax: 15000,          // Max random delay (15 sec)
        changeVPNAfter: 100,            // Change VPN after X businesses
        breakAfterSession: 3600000      // 1 hour break after session
    },

    // Output settings
    output: {
        filename: 'real_estate_leads.xlsx',
        columns: ['name', 'phone', 'email', 'country', 'city', 'category', 'scraped_date']
    },

    // User agents for rotation
    userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ]
};
