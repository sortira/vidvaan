/**
 * Fetches publications from OpenAlex API based on the provided topic.
 * @async
 * @function openalex
 * @param {string} topic - The search topic.
 * @returns {Promise<Array>} - The array of publication results.
 */
async function openalex(topic) {
    const encodedTopic = encodeURIComponent(topic);
    const url = `https://api.openalex.org/works?filter=title.search:${encodedTopic}`;
    const publications = [];

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        data.results.forEach(work => {
            publications.push({
                title: work.title,
                year: work.publication_year,
                authors: work.authorships.map(authorship => authorship.author.display_name).join(', '),
                url: work.id,
                repo: 'OpenAlex'
            });
        });
    } catch (error) {
        console.error('Error fetching publications:', error);
    }

    return publications;
}