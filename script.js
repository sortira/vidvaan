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
            
            if (i === currentPage) {
                pageButton.className = 'active'; // Add 'active' class to the current page button
            }

            pageButton.addEventListener('click', () => displayPublications(publications, i, rowsPerPage));
            paginationControls.appendChild(pageButton);
        }

        publicationContainer.appendChild(paginationControls);
    }
}
