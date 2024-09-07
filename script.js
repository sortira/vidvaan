// Debounce function to limit the frequency of search calls
let debounceTimeout;
let originalPublications = [];
let aiSumText = " ";
window.serverlink = "https://thatasifwhodevelopsweb.pythonanywhere.com/"

document.getElementById("topic").addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        searchPublications();
    }, 500); // Wait for 500ms before triggering the search
});

async function searchPublications() {
    const topic = document.getElementById("topic").value.trim();
    const publicationContainer = document.getElementById('publications');

    // Check if the topic has at least 2 characters
    if (topic.length < 2) {
        publicationContainer.innerHTML = "<p>Please enter at least 2 characters to search.</p>";
        return;
    }

    // Clear the previous results
    publicationContainer.innerHTML = "<h2>Loading...</h2>";

    try {
        // Fetch from all sources in parallel
        const [dblpResults, arxivResults, openalexResults] = await Promise.all([
            dblp(topic),
            arxiv(topic),
            openalex(topic)
        ]);

        // Combine results from all sources
        const publications = [...dblpResults, ...arxivResults, ...openalexResults];

        // Store publications globally to manage pagination
        originalPublications = [...publications]; // Store a copy of the original publications
        window.publications = publications;

        // Display all results
        displayPublications(publications);

        // Show filter and download controls after data is loaded
        document.getElementById('filter-download-container').style.display = 'block';
    } catch (error) {
        publicationContainer.innerHTML = `<p>Error fetching publications: ${error.message}</p>`;
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
    publicationContainer.innerHTML = "";  // Clear the container initially

    if (publications.length === 0) {
        publicationContainer.innerHTML = "<h2>Search Results</h2><p>No publications found for this topic.</p>";
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(publications.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPublications = publications.slice(startIndex, endIndex);

    // Create and append pagination controls
    const paginationControls = buildPaginationControls(totalPages, currentPage, publications, rowsPerPage);
    publicationContainer.appendChild(paginationControls);

    // Create and append the publications table
    const table = buildPublicationsTable(paginatedPublications);
    publicationContainer.appendChild(table);
}

/**
 * Builds the pagination controls.
 * @function buildPaginationControls
 * @param {number} totalPages - Total number of pages.
 * @param {number} currentPage - The current page number.
 * @param {Array} publications - The array of publications.
 * @param {number} rowsPerPage - The number of rows to display per page.
 * @returns {HTMLElement} The pagination controls container.
 */
function buildPaginationControls(totalPages, currentPage, publications, rowsPerPage) {
    const paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';
    paginationControls.style.display = 'flex';
    paginationControls.style.justifyContent = 'center';
    paginationControls.style.marginBottom = '10px';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.style.margin = '5px';
        pageButton.style.minWidth = '40px';
        pageButton.style.padding = '10px';
        pageButton.style.border = i === currentPage ? '3px solid #000000' : 'none';
        pageButton.style.backgroundColor = i === currentPage ? 'rgb(227, 94, 53)' : 'rgba(227, 94, 53, 0.7)';
        pageButton.style.color = '#fff';
        pageButton.addEventListener('click', () => displayPublications(publications, i, rowsPerPage));
        paginationControls.appendChild(pageButton);
    }

    return paginationControls;
}

/**
 * Builds the publications table.
 * @function buildPublicationsTable
 * @param {Array} publications - The array of publications to display in the table.
 * @returns {HTMLElement} The table element containing publication data.
 */
function buildPublicationsTable(publications) {
    const table = document.createElement('table');
    table.className = 'pubs';
    table.style.borderCollapse = 'collapse';

    const headerRow = document.createElement('tr');
    ['Title', 'Year', 'Authors', 'Academic Database'].forEach(text => {
        const header = document.createElement('th');
        header.textContent = text;
        header.style.border = '1px solid black';
        header.style.padding = '8px';
        header.style.textAlign = 'left';
        headerRow.appendChild(header);
    });

    table.appendChild(headerRow);

    publications.forEach(pub => {
        const row = document.createElement('tr');

        // Create title cell with a link
        const titleCell = document.createElement('td');
        const link = document.createElement('a');
        link.href = pub.url;
        link.textContent = pub.title;
        link.target = '_blank'; // Opens the link in a new tab
        titleCell.appendChild(link);
        titleCell.style.border = '1px solid black';
        titleCell.style.padding = '8px';

        // Create year cell
        const yearCell = document.createElement('td');
        yearCell.textContent = pub.year;
        yearCell.style.border = '1px solid black';
        yearCell.style.padding = '8px';

        // Create authors cell
        const authorsCell = document.createElement('td');
        authorsCell.textContent = pub.authors;
        authorsCell.style.border = '1px solid black';
        authorsCell.style.padding = '8px';

        // Create repository cell
        const repoCell = document.createElement('td');
        repoCell.textContent = pub.repo;
        repoCell.style.border = '1px solid black';
        repoCell.style.padding = '8px';

        // Append cells to the row
        row.appendChild(titleCell);
        row.appendChild(yearCell);
        row.appendChild(authorsCell);
        row.appendChild(repoCell);
        table.appendChild(row);
    });

    return table;
}

async function getAI() {
    if (window.publications.length === 0) {
        alert("No publications to summarize.");
        return;
    }

    // Extract the titles of all publications to send as the summaries field
    const summaries = window.publications.map(pub => pub.title);

    try {
        // Make the POST request to /summarise endpoint
        const response = await fetch(window.serverlink + '/summarise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ summaries })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Display the summary in the UI
        displayAISummary(data.summary);
    } catch (error) {
        console.error("Error fetching AI summary:", error);
        alert("There was an error generating the AI summary. Please try again later.");
    }
}

/**
 * Displays the AI-generated summary in the UI.
 * @param {string} summary - The AI-generated summary to display.
 */
function displayAISummary(summary) {
    const aiSummaryContainer = document.getElementById('ai-summary');
    console.log("SUMMARY : " + summary)
    aiSumText = summary;
    if (!aiSummaryContainer) {
        console.error("AI Summary container not found!");
        return;
    }

    aiSummaryContainer.innerHTML = `
        <h2>AI-Generated Summary</h2>
        <p>${summary}</p>
    `;
}
