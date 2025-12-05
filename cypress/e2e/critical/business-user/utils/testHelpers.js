// ========================================
// FILE: cypress/e2e/business-user/utils/testHelpers.js
// ========================================

export const adjectives = [
    'blue', 'red', 'green', 'happy', 'swift', 'bright', 'calm', 'bold',
    'wise', 'quick', 'smart', 'cool', 'warm', 'fresh', 'clear', 'pure',
    'silver', 'golden', 'wild', 'gentle', 'strong', 'brave', 'proud', 'noble'
];

export const nouns1 = [
    'ocean', 'mountain', 'river', 'forest', 'cloud', 'star', 'moon', 'sun',
    'wind', 'stone', 'tree', 'flower', 'bird', 'fish', 'wave', 'sky',
    'cocoon', 'valley', 'peak', 'meadow', 'spring', 'autumn', 'winter', 'summer'
];

export const nouns2 = [
    'tiger', 'eagle', 'wolf', 'bear', 'lion', 'hawk', 'fox', 'deer',
    'rabbit', 'goat', 'horse', 'dragon', 'phoenix', 'whale', 'dolphin', 'owl',
    'panda', 'koala', 'zebra', 'giraffe', 'elephant', 'rhino', 'leopard', 'cheetah'
];

export const generateRandomDomain = (extension = 'com') => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun1 = nouns1[Math.floor(Math.random() * nouns1.length)];
    const noun2 = nouns2[Math.floor(Math.random() * nouns2.length)];
    return `${adjective}${noun1}${noun2}.${extension}`;
};

export const generateRandomDomainList = (count = 5) => {
    const extensions = ['com', 'org', 'net', 'io', 'co'];
    const domains = new Set();
    let attempts = 0;
    const maxAttempts = count * 10;
    
    while (domains.size < count && attempts < maxAttempts) {
        const ext = extensions[domains.size % extensions.length];
        const domain = generateRandomDomain(ext);
        domains.add(domain);
        attempts++;
    }
    
    return Array.from(domains);
};

export const cleanupTestData = (testData) => {
    if (testData && testData.email) {
        cy.log(`🧹 Cleaning up test data for: ${testData.email}`);
        
        cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/api/test/cleanup`,
            body: {
                email: testData.email,
                domain: testData.uniqueDomain,
                companyName: testData.companyName
            },
            failOnStatusCode: false,
            timeout: 15000
        }).then((response) => {
            if (response.status === 200) {
                cy.log('✅ Cleanup successful');
            } else {
                cy.log(`⚠️ Cleanup response (${response.status})`);
            }
        }).catch((error) => {
            cy.log('⚠️ Cleanup error (non-critical):', error.message);
        });
    }
};

export const generateTestData = (userData) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    
    return {
        email: `bizuser-${timestamp}-${randomId}@yopmail.com`,
        password: 'SecurePass123!',
        companyName: `Test Company ${timestamp}`,
        firstName: userData.newUser.firstName,
        lastName: userData.newUser.lastName,
        uniqueDomain: generateRandomDomain()
    };
};
