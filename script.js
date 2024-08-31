// Debounce function to limit the frequency of search calls
let debounceTimeout;
let originalPublications = [];


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
        originalPublications = publications.slice(); // Store a copy of the original publications
        window.publications = publications;

        // Final display with all results
        displayPublications(publications);
    } catch (error) {
        publicationContainer.innerHTML = `<p>Error fetching publications: ${error.message}</p>`;
    }
}



/**
 * Filters the publications based on the start and end year.
 * @function applyYearFilter
 */
function applyYearFilter() {
    const startYear = parseInt(document.getElementById("startYear").value);
    const endYear = parseInt(document.getElementById("endYear").value);


    if (endYear < startYear) return;


    const filteredPublications = originalPublications.filter(pub => {
        const pubYear = parseInt(pub.year);
        return (!isNaN(startYear) ? pubYear >= startYear : true) &&
            (!isNaN(endYear) ? pubYear <= endYear : true);
    });

    // Re-render the table with filtered results
    window.publications = filteredPublications; // Update the publications array with the filtered results
    displayPublications(filteredPublications);
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

            publications.push({
                title,
                year,
                authors,
                url,
                repo: 'ArXiv'
            });
        }
    } catch (error) {
        console.error('Error fetching publications:', error);
    }

    return publications;
}

/**
 * Displays the list of publications in a paginated table format.
 * @function displayPublications
 * @param {Array} publications - The array of publications to display.
 * @param {number} currentPage - The current page number to display.
 * @param {number} rowsPerPage - The number of rows to display per page.
 */
function displayPublications(publications, currentPage = 1, rowsPerPage = 50) {
    const publicationContainer = document.getElementById('publications');
    publicationContainer.innerHTML = "<h2>Search Results</h2>";

    if (publications.length === 0) {
        publicationContainer.innerHTML += "<p>No publications found for this topic.</p>";
        return;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPublications = publications.slice(startIndex, endIndex);

    const table = document.createElement('table');
    table.className = 'sortable';
    table.style.borderCollapse = 'collapse';

    const headerRow = document.createElement('tr');

    const titleHeader = document.createElement('th');
    titleHeader.textContent = 'Title';
    titleHeader.style.border = '1px solid black';
    titleHeader.style.padding = '8px';
    titleHeader.style.textAlign = 'left';

    const yearHeader = document.createElement('th');
    yearHeader.textContent = 'Year';
    yearHeader.style.border = '1px solid black';
    yearHeader.style.padding = '8px';
    yearHeader.style.textAlign = 'left';

    const authorsHeader = document.createElement('th');
    authorsHeader.textContent = 'Authors';
    authorsHeader.style.border = '1px solid black';
    authorsHeader.style.padding = '8px';
    authorsHeader.style.textAlign = 'left';

    const repoHeader = document.createElement('th');
    repoHeader.textContent = 'Academic Database';
    repoHeader.style.border = '1px solid black';
    repoHeader.style.padding = '8px';
    repoHeader.style.textAlign = 'left';

    headerRow.appendChild(titleHeader);
    headerRow.appendChild(yearHeader);
    headerRow.appendChild(authorsHeader);
    headerRow.appendChild(repoHeader);
    table.appendChild(headerRow);

    paginatedPublications.forEach(pub => {
        const row = document.createElement('tr');

        const titleCell = document.createElement('td');
        const link = document.createElement('a');
        link.href = pub.url;
        link.textContent = pub.title;
        link.target = '_blank'; // Opens the link in a new tab
        titleCell.appendChild(link);
        titleCell.style.border = '1px solid black';
        titleCell.style.padding = '8px';

        const yearCell = document.createElement('td');
        yearCell.textContent = pub.year;
        yearCell.style.border = '1px solid black';
        yearCell.style.padding = '8px';

        const authorsCell = document.createElement('td');
        authorsCell.textContent = pub.authors;
        authorsCell.style.border = '1px solid black';
        authorsCell.style.padding = '8px';

        const repoCell = document.createElement('td');
        repoCell.textContent = pub.repo;
        repoCell.style.border = '1px solid black';
        repoCell.style.padding = '8px';

        row.appendChild(titleCell);
        row.appendChild(yearCell);
        row.appendChild(authorsCell);
        row.appendChild(repoCell);
        table.appendChild(row);
    });

    publicationContainer.appendChild(table);

    // Add vertical pagination controls on the right side
    if (publications.length > rowsPerPage) {
        const paginationControls = document.createElement('div');
        paginationControls.className = 'pagination-controls';
        paginationControls.style.position = 'fixed';
        paginationControls.style.right = '10px';
        paginationControls.style.top = '50%';
        paginationControls.style.transform = 'translateY(-50%)';
        paginationControls.style.display = 'flex';
        paginationControls.style.flexDirection = 'column';

        const totalPages = Math.ceil(publications.length / rowsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.style.margin = '2px';
            pageButton.style.border = i === currentPage ? '3px solid #000000' : 'none'; // Add border to the active page
            pageButton.style.backgroundColor = i === currentPage ? '#007bff' : '#3C7398'; // Highlight the active page
            pageButton.addEventListener('click', () => displayPublications(publications, i, rowsPerPage));
            paginationControls.appendChild(pageButton);
        }

        publicationContainer.appendChild(paginationControls);
    }
}





function exportExcel() {
    $('.sortable').table2excel({
        exclude: ".no-export",
        filename: "download.xls",
        fileext: ".xls",
        exclude_links: false,
        exclude_inputs: true
    });
}
