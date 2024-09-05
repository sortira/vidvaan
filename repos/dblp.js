/**
 * Fetches publications from DBLP API based on the provided topic.
 * @async
 * @function dblp
 * @param {string} topic - The search topic.
 * @returns {Promise<Array>} - The array of publication results.
 */
async function dblp(topic) {
    const publications = [];

    try {
        let result = await fetch(encodeURI(`https://dblp.org/search/publ/api?q=${topic}&format=json`), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        }).then(response => response.json());

        const papers = result["result"]["hits"]["hit"]; // an array of papers

        papers.forEach(paper => {
            let authors = 'Unknown';

            if (paper.info.authors && paper.info.authors.author) {
                if (Array.isArray(paper.info.authors.author)) {
                    authors = paper.info.authors.author.map(a => a.text).join(', ');
                } else {
                    authors = paper.info.authors.author.text;
                }
            }

            // Generate a simple summary based on the title and authors
            const summary = `This paper titled "${paper.info.title}" was authored by ${authors} and published in ${paper.info.year}.`;

            publications.push({
                title: paper.info.title,
                year: paper.info.year,
                authors: authors,
                url: paper.info.url,
                summary, // Add the generated summary
                repo: 'DBLP'
            });
        });
    } catch (error) {
        console.error('Error fetching publications:', error);
    }

    return publications;
}
