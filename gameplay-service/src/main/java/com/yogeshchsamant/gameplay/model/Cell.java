package com.yogeshchsamant.gameplay.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cell {
    private int x;
    private int y;
    private boolean hasBase;
    private boolean isHit;

}
