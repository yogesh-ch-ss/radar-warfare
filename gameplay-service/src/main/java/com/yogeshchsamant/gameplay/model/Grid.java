package com.yogeshchsamant.gameplay.model;

import java.io.Serializable;
import java.util.*;

import lombok.Data;

@Data
public class Grid implements Serializable {
    private static final long serialVersionUID = 1L;
    private List<List<Cell>> grid = new ArrayList<List<Cell>>();
    private int defences;

    public Grid() {

        this.defences = 10; // 10 defence units

        for (int i = 0; i < 10; i++) {
            List<Cell> row = new ArrayList<>();
            for (int j = 0; j < 10; j++) {
                row.add(new Cell(i, j, false, false));
            }
            this.grid.add(row);
        }

    }

    public void fillCellsForTest() {
        // this function fills 2 cells with a base
        // cells filled with a base - (0, 0), (4, 5)
        // sets defences value as 2

        Optional<Cell> cell1 = getCell(0, 0);
        Optional<Cell> cell2 = getCell(4, 5);

        cell1.get().setHasBase(true);
        cell2.get().setHasBase(true);

        setDefences(2);
    }

    public Optional<Cell> getCell(int i, int j) {
        if (i > -1 && i < 10 && j > -1 && j < 10) {
            return Optional.of(this.grid.get(i).get(j));
        }
        return Optional.empty();
    }

    public void defenceAttacked() {
        this.defences -= 1;
    }
}
