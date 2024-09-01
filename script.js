// Debounce function to limit the frequency of search calls
let debounceTimeout;
let originalPublications = [];


document.getElementById("topic").addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        work();
    }, 500); // Wait for 500ms before triggering the search
});

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
            originalPublications.push(...results);
            // Display partial results
            displayPublications(publications);
        }

        // Store publications globally to manage pagination
        originalPublications = publications.slice(); // Store a copy of the original publications
        window.publications = publications;

        // Final display with all results
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
    publicationContainer.innerHTML = "<h2>Search Results</h2>";

    if (publications.length === 0) {
        publicationContainer.innerHTML += "<p>No publications found for this topic.</p>";
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(publications.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPublications = publications.slice(startIndex, endIndex);

    // Create pagination controls
    const paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';
    paginationControls.style.display = 'flex';
    paginationControls.style.justifyContent = 'center';
    paginationControls.style.marginBottom = '10px'; // Add some space between the pagination and the table

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.style.margin = '5px 5px';
        pageButton.style.minWidth = '40px'; // Set a minimum width for the buttons
        pageButton.style.padding = '10px 10px'; // Add padding for better spacing
        pageButton.style.border = i === currentPage ? '3px solid #000000' : 'none'; // Highlight active page
        pageButton.style.backgroundColor = i === currentPage ? 'rgb(227, 94, 53)' : 'rgba(227, 94, 53, 0.7)'; // Highlight active page
        pageButton.style.color = '#fff'; // Set text color
        pageButton.addEventListener('click', () => displayPublications(publications, i, rowsPerPage));
        paginationControls.appendChild(pageButton);
    }

    // Append pagination controls to the publication container
    publicationContainer.appendChild(paginationControls);

    // Create the table
    const table = document.createElement('table');
    table.className = 'pubs';
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

    // Append the table to the publication container
    publicationContainer.appendChild(table);
}