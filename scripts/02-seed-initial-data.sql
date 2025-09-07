-- Insert system administrator
INSERT INTO users (name, email, password_hash, address, role) VALUES
('System Administrator Account', 'admin@storerating.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', '123 Admin Street, Admin City, AC 12345', 'system_administrator');

-- Insert sample stores
INSERT INTO stores (name, email, address) VALUES
('Tech Electronics Store', 'contact@techelectronics.com', '456 Tech Avenue, Silicon Valley, CA 94000'),
('Fashion Boutique Central', 'info@fashionboutique.com', '789 Fashion Street, New York, NY 10001'),
('Organic Food Market', 'hello@organicfood.com', '321 Green Lane, Portland, OR 97201'),
('Sports Equipment Hub', 'support@sportshub.com', '654 Sports Drive, Denver, CO 80202'),
('Book Haven Library Store', 'books@bookhaven.com', '987 Literature Boulevard, Boston, MA 02101');

-- Insert sample normal users
INSERT INTO users (name, email, password_hash, address, role) VALUES
('John Michael Smith Johnson', 'john.smith@email.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', '123 Main Street, Anytown, ST 12345', 'normal_user'),
('Sarah Elizabeth Johnson Williams', 'sarah.johnson@email.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', '456 Oak Avenue, Another City, ST 67890', 'normal_user'),
('Michael Robert Davis Brown', 'michael.davis@email.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', '789 Pine Road, Different Town, ST 54321', 'normal_user');

-- Insert store owners and link them to stores
INSERT INTO users (name, email, password_hash, address, role) VALUES
('Robert James Anderson Wilson', 'robert.anderson@techelectronics.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', '456 Tech Avenue, Silicon Valley, CA 94000', 'store_owner'),
('Emily Catherine Martinez Garcia', 'emily.martinez@fashionboutique.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', '789 Fashion Street, New York, NY 10001', 'store_owner');

-- Update stores with their owners
UPDATE stores SET owner_id = (SELECT id FROM users WHERE email = 'robert.anderson@techelectronics.com') WHERE email = 'contact@techelectronics.com';
UPDATE stores SET owner_id = (SELECT id FROM users WHERE email = 'emily.martinez@fashionboutique.com') WHERE email = 'info@fashionboutique.com';

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES
((SELECT id FROM users WHERE email = 'john.smith@email.com'), (SELECT id FROM stores WHERE email = 'contact@techelectronics.com'), 5),
((SELECT id FROM users WHERE email = 'john.smith@email.com'), (SELECT id FROM stores WHERE email = 'info@fashionboutique.com'), 4),
((SELECT id FROM users WHERE email = 'sarah.johnson@email.com'), (SELECT id FROM stores WHERE email = 'contact@techelectronics.com'), 4),
((SELECT id FROM users WHERE email = 'sarah.johnson@email.com'), (SELECT id FROM stores WHERE email = 'hello@organicfood.com'), 5),
((SELECT id FROM users WHERE email = 'michael.davis@email.com'), (SELECT id FROM stores WHERE email = 'support@sportshub.com'), 3),
((SELECT id FROM users WHERE email = 'michael.davis@email.com'), (SELECT id FROM stores WHERE email = 'books@bookhaven.com'), 5);
