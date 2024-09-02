/**
 * Fetches publications from OpenLibrary API based on the provided topic.[Obsolete due to slow response times of OpenLibrary, fix needed to limit response time]
 * @async
 * @function openLibrary
 * @param {string} topic - The search topic.
 * @returns {Promise<Array>} - The array of publication results.
 */
async function openLibrary(topic) {
    const encodedTopic = encodeURIComponent(topic);
    const url = `https://openlibrary.org/search.json?q=${encodedTopic}`;
    const publications = [];

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.docs && Array.isArray(data.docs)) {
            data.docs.forEach(work => {
                const title = work.title || 'Unknown Title';
                const year = work.first_publish_year || 'Unknown Year';
                const authors = work.author_name ? work.author_name.join(', ') : 'Unknown Authors';
                const seed = work.seed && work.seed.length > 0 ? work.seed[0] : 'No Seed Available';

                publications.push({
                    title: title,
                    year: year,
                    authors: authors,
                    url: `https://openlibrary.org${seed}`,
                    repo: 'OpenLibrary'
                });
            });
        }
    } catch (error) {
        console.error('Error fetching publications:', error);
    }

    return publications;
}