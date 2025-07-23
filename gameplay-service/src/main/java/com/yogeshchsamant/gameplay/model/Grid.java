package com.yogeshchsamant.gameplay.model;

import java.io.Serializable;
import java.util.*;

import lombok.Data;

@Data
public class Grid implements Serializable{
    private static final long serialVersionUID = 1L;
    private List<List<Cell>> grid = new ArrayList<List<Cell>>();

    public Grid() {
        for (int i = 0; i < 10; i++) {
            List<Cell> row = new ArrayList<>();
            for (int j = 0; j < 10; j++) {
                row.add(new Cell(i, j, false, false));
            }
            this.grid.add(row);
        }
    }

    public Optional<Cell> getCell(int i, int j) {
        if (i > -1 && i < 10 && j > -1 && j < 10) {
            return Optional.of(this.grid.get(i).get(j));
        }
        return Optional.empty();
    }
}
