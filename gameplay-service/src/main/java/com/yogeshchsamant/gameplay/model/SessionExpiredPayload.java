package com.yogeshchsamant.gameplay.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SessionExpiredPayload {
    private String sessionId;
}
