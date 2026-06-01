CREATE DATABASE IF NOT EXISTS monument_db;
USE monument_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monuments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monument_name VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    built_by VARCHAR(150),
    architecture VARCHAR(150),
    history TEXT,
    famous_facts TEXT,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    image_name VARCHAR(255),
    predicted_monument VARCHAR(150),
    confidence_score FLOAT,
    predictions_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Default data seeding
INSERT INTO monuments (monument_name, location, built_by, architecture, history, famous_facts, image_path) VALUES
('Taj Mahal', 'Agra, India', 'Shah Jahan', 'Mughal Architecture', 'The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna river in the Indian city of Agra. It was commissioned in 1631 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal; it also houses the tomb of Shah Jahan himself.', 'One of the Seven Wonders of the World; Changes colors depending on the time of day and moonlight; Completed in 1643 with a cost of 32 million rupees.', '/static/images/taj.jpg'),
('India Gate', 'New Delhi, India', 'Edwin Lutyens (Architect)', 'Memorial Triumphal Arch', 'The India Gate is a war memorial located astride the Rajpath, on the eastern edge of the \"ceremonial axis\" of New Delhi, formerly called duty path. It stands as a memorial to 84,000 soldiers of the British Indian Army who died between 1914 and 1921 in the First World War.', 'Inspired by the Arc de Triomphe in Paris; Contains the Amar Jawan Jyoti, an eternal flame burning since 1971; Houses names of over 13,000 soldiers inscribed on its walls.', '/static/images/india_gate.jpg'),
('Qutub Minar', 'New Delhi, India', 'Qutb-ud-din Aibak', 'Indo-Islamic Architecture', 'The Qutub Minar is a minaret and \"victory tower\" that forms part of the Qutb complex, which lies at the site of Delhi\'s oldest fortified city, Lal Kot, founded by the Tomar Rajputs. It is a UNESCO World Heritage Site in the Mehrauli area of South Delhi.', 'The tallest brick minaret in the world at 72.5 meters; Houses an ancient rust-resistant Iron Pillar dating back to the Gupta Empire; Leaning slightly but structurally sound.', '/static/images/qutub.jpg'),
('Eiffel Tower', 'Paris, France', 'Gustave Eiffel', 'Wrought-Iron Lattice', 'The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel, whose company designed and built the tower. Locally nicknamed \"La dame de fer\", it was constructed from 1887 to 1889 as the centerpiece of the 1889 World\'s Fair.', 'Grows taller by up to 15cm during summer due to thermal expansion; Originally intended to be temporary and demolished after 20 years; Visited by over 7 million people annually.', '/static/images/eiffel.jpg');
