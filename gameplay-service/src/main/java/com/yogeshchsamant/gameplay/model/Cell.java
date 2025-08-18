package com.yogeshchsamant.gameplay.model;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cell implements Serializable {
    private static final long serialVersionUID = 1L;
    private int x;
    private int y;
    private boolean hasBase;
    private boolean isHit;
    private int number;

}
