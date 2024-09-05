/**
 * Fetches publications from ArXiv API based on the provided topic.
 * @async
 * @function arxiv
 * @param {string} topic - The search topic.
 * @returns {Promise<Array>} - The array of publication results.
 */
async function arxiv(topic) {
    const encodedTopic = encodeURIComponent(topic);
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodedTopic}&start=0&max_results=100`;
    const publications = [];

    try {
        const response = await fetch(url);
        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");

        const entries = xmlDoc.getElementsByTagName("entry");

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const title = entry.getElementsByTagName("title")[0].textContent.trim();
            const publishedDate = entry.getElementsByTagName("published")[0].textContent;
            const year = new Date(publishedDate).getFullYear();
            const url = entry.getElementsByTagName("id")[0].textContent.trim();
            const authors = Array.from(entry.getElementsByTagName("author")).map(author => author.getElementsByTagName("name")[0].textContent).join(', ');
            const summary = entry.getElementsByTagName("summary")[0].textContent.trim();

            publications.push({
                title,
                year,
                authors,
                url,
                summary, // Added summary field
                repo: 'ArXiv'
            });
        }
    } catch (error) {
        console.error('Error fetching publications:', error);
    }

    return publications;
}
