let debounceTimeout;

document.getElementById("topic").addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        work();
    }, 500); // Wait for 500ms before triggering the search
});

/**
 * Main function that consolidates publications from various sources
 * and displays them.
 * @async
 * @function work
 */
async function work() {
    const topic = document.getElementById("topic").value.trim();
    const publicationContainer = document.getElementById('publications');

    // Check if the topic has at least 2 characters
    if (topic.length < 2) {
        publicationContainer.innerHTML = "<p>Please enter at least 2 characters to search.</p>";
        return;
    }

    const publications = [];

    // Clear the previous results
    publicationContainer.innerHTML = "<h2>Loading...</h2>";

    try {
        // Fetch from all sources in parallel
        const fetchFunctions = [dblp(topic), arxiv(topic), openalex(topic), openLibrary(topic)];

        for (let fetchPromise of fetchFunctions) {
            const results = await fetchPromise;
            publications.push(...results);
            // Display partial results
            displayPublications(publications);
        }

        // Store publications globally to manage pagination
        window.publications = publications;

        // Final display with all results
        displayPublications(publications);
    } catch (error) {
        publicationContainer.innerHTML = `<p>Error fetching publications: ${error.message}</p>`;
    }
}

/**
 * Fetches publications from OpenLibrary API based on the provided topic.
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

            publications.push({
                title: paper.info.title,
                year: paper.info.year,
                authors: authors,
                url: paper.info.url,
                repo: 'DBLP'
            });
        });
    } catch (error) {
        console.error('Error fetching publications:', error);
    }

    return publications;
}

/**
 * Fetches publications from ArXiv API based on the provided topic.
 * @async
 * @function arxiv
 * @param {string} topic - The search topic.
 * @returns {Promise<Array>} - The array of publication results.
 */
async function arxiv(topic) {
    const encodedTopic = encodeURIComponent(topic);
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodedTopic}&start=0&max_results=100`;
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
 
