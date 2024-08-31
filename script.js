/**
 * Main function that consolidates publications from various sources
 * and displays them.
 * @async
 * @function work
 */
async function work() {
    const topic = document.getElementById("topic").value;
    const publications = [];

    // Fetch from all sources and consolidate the results
    await dblp(topic, publications);
    await arxiv(topic, publications);
    await openalex(topic, publications);
    await openLibrary(topic, publications);

    // Store publications globally to manage pagination
    window.publications = publications;
    displayPublications(publications);
}

/**
 * Fetches publications from OpenLibrary API based on the provided topic.
 * @async
 * @function openLibrary
 * @param {string} topic - The search topic.
 * @param {Array} publications - The array to store publication results.
 * @returns {Promise<void>}
 */
async function openLibrary(topic, publications) {
    const encodedTopic = encodeURIComponent(topic);
    const url = `https://openlibrary.org/search.json?q=${encodedTopic}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();

        // Make sure 'docs' key exists in the response data
        if (data.docs && Array.isArray(data.docs)) {
            data.docs.forEach(work => {
                // Check if the necessary fields exist
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
}

/**
 * Fetches publications from OpenAlex API based on the provided topic.
 * @async
 * @function openalex
 * @param {string} topic - The search topic.
 * @param {Array} publications - The array to store publication results.
 * @returns {Promise<void>}
 */
async function openalex(topic, publications) {
    const encodedTopic = encodeURIComponent(topic);
    const url = `https://api.openalex.org/works?filter=title.search:${encodedTopic}`;

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
}

/**
 * Fetches publications from DBLP API based on the provided topic.
 * @async
 * @function dblp
 * @param {string} topic - The search topic.
 * @param {Array} publications - The array to store publication results.
 * @returns {Promise<void>}
 */
async function dblp(topic, publications) {
    let result = await fetch(encodeURI(`https://dblp.org/search/publ/api?q=${topic}&format=json`), {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.json());

    const papers = result["result"]["hits"]["hit"]; // an array of papers

    papers.forEach(paper => {
        let authors = 'Unknown';

        // Check if the authors field exists
        if (paper.info.authors && paper.info.authors.author) {
            if (Array.isArray(paper.info.authors.author)) {
                // If it's an array, map over the array
                authors = paper.info.authors.author.map(a => a.text).join(', ');
            } else {
                // If it's an object, handle it as a single author
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
}

/**
 * Fetches publications from ArXiv API based on the provided topic.
 * @async
 * @function arxiv
 * @param {string} topic - The search topic.
 * @param {Array} publications - The array to store publication results.
 * @returns {Promise<void>}
 */
async function arxiv(topic, publications) {
    const encodedTopic = encodeURIComponent(topic);
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodedTopic}&start=0&max_results=100`;

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

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPublications = publications.slice(startIndex, endIndex);

    // Create the table and header row
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

    // Append rows for each publication
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

    // Append the table to the container
    publicationContainer.appendChild(table);

    // Add pagination controls on the right side
    const paginationControls = createPaginationControls(publications.length, rowsPerPage, currentPage);
    publicationContainer.appendChild(paginationControls);
}

/**
 * Creates pagination controls.
 * @function createPaginationControls
 * @param {number} totalItems - The total number of items.
 * @param {number} rowsPerPage - The number of rows per page.
 * @param {number} currentPage - The current page number.
 * @returns {HTMLElement} - The pagination controls element.
 */
function createPaginationControls(totalItems, rowsPerPage, currentPage) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const paginationWrapper = document.createElement('div');

    // Style the pagination wrapper to be on the right side
    paginationWrapper.style.position = 'fixed';
    paginationWrapper.style.right = '20px';
    paginationWrapper.style.top = '50%';
    paginationWrapper.style.transform = 'translateY(-50%)';
    paginationWrapper.style.display = 'flex';
    paginationWrapper.style.flexDirection = 'column';
    paginationWrapper.style.alignItems = 'center';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.style.marginBottom = '10px';
        pageButton.style.padding = '10px 15px';
        pageButton.style.cursor = 'pointer';
        pageButton.style.borderRadius = '5px';
        pageButton.style.border = '1px solid #ccc';
        pageButton.style.backgroundColor = i === currentPage ? '#007bff' : '#f8f9fa';
        pageButton.style.color = i === currentPage ? '#fff' : '#000';

        if (i === currentPage) {
            pageButton.disabled = true;
            pageButton.style.fontWeight = 'bold';
        }

        pageButton.addEventListener('click', () => {
            displayPublications(window.publications, i, rowsPerPage);
        });

        paginationWrapper.appendChild(pageButton);
    }

    return paginationWrapper;
}
