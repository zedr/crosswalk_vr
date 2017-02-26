(function () {
    "use strict";

    const targetSel = "#setup",
        tableClassName = "map-table";

    function createArray(n, val) {
        return Array.apply(null, Array(n)).map(() => val);
    }

    function createMatrix(n, val) {
        return Array.apply(null, Array(n)).map(() => createArray(n, val));
    }

    function createGridTable(size) {
        const matrix = createMatrix(size, 0),
            cellMatrix = createMatrix(size, null),
            table = document.createElement("table"),
            tbody = document.createElement("tbody");

        table.appendChild(tbody);
        table.className = "map-table";

        for (let y = 0; y < size; y++) {
            let row = document.createElement("tr");
            for (let x = 0; x < size; x++) {
                let cell = document.createElement("td");
                cell.textContent = matrix[y][x];
                cell.incrementContent = () => {
                    cell.textContent = matrix[y][x] = matrix[y][x] + 1;
                };
                cell.raise = () => {
                    cell.incrementContent();
                    [
                        [[y], [x + 1]],
                        [[y], [x - 1]],
                        [[y + 1], [x]],
                        [[y - 1], [x]],
                        [y + 1][x - 1],
                        [y - 1][x - 1],
                        [y + 1][x + 1],
                        [y - 1][x + 1]
                    ].forEach((loc) => {
                        try {
                            cellMatrix[loc[0]][loc[1]].incrementContent();
                        } catch (err) { };
                    });
                };
                cell.addEventListener("mouseover", cell.raise);
                cell.addEventListener("touchstart", cell.raise);
                cell.addEventListener("touchmove", cell.raise);
                cell.addEventListener("touchend", cell.raise);
                cellMatrix[y][x] = cell;
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }

        table.matrix = matrix;

        return table;

    }

    function initialise() {
        const editor = document.querySelector(targetSel),
            grid = createGridTable(30),
            button = document.querySelector("button");

        editor.appendChild(grid);
        button.addEventListener("click", function () {
            editor.remove();
            button.remove();
            window.initGame(grid.matrix);
        });
    };

    window.addEventListener("load", initialise);
}());