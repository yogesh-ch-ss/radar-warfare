package com.yogeshchsamant.gameplay.model;

import java.io.Serializable;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.yogeshchsamant.gameplay.service.GameplayService;

import lombok.Data;

@Data
public class Grid implements Serializable {

    @JsonIgnore
    Logger logger = LoggerFactory.getLogger(GameplayService.class);

    private static final long serialVersionUID = 1L;
    private List<List<Cell>> grid = new ArrayList<List<Cell>>();
    private int defences;

    public Grid() {

        this.defences = 10; // 10 defence units

        for (int i = 0; i < 10; i++) {
            List<Cell> row = new ArrayList<>();
            for (int j = 0; j < 10; j++) {
                row.add(new Cell(i, j, false, false, 0));
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

    public void fillCells() {
        this.fillCells_bases();
        this.fillCells_numbers();
    }

    public void fillCells_bases() {
        int cellsFilled = 0;
        Random r = new Random();

        while (cellsFilled < 10) {
            int i = r.nextInt(10);
            int j = r.nextInt(10);

            if (!getCell(i, j).get().isHasBase()) {
                logger.info("(" + i + ", " + j + ") has been filled.");
                this.getCell(i, j).get().setHasBase(true);
                cellsFilled += 1;
            }
        }
        logger.info("Cells filled with bases.");
    }

    public void fillCells_numbers() {
        // to be called after fillCells_bases()
        for (int i = 0; i < 10; i++) {
            for (int j = 0; j < 10; j++) {
                Optional<Cell> cell = this.getCell(i, j);
                cell.get().setNumber(this.calculateNumber(i, j));
            }
        }
        logger.info("Cells filled with numbers.");
    }

    public int calculateNumber(int r, int c) {
        int n = 0;
        if (this.getCell(r, c).get().isHasBase()) {
            return 0;
        }
        for (int i = r - 1; i <= r + 1; i++) {
            for (int j = c - 1; j <= c + 1; j++) {
                if (i > -1 && i < 10 && j > -1 && j < 10 && this.getCell(i, j).get().isHasBase()) {
                    n += 1;
                }
            }
        }
        return n;
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
