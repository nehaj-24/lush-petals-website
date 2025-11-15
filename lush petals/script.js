// Ensure the script runs after the entire document is loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- Helper Functions for Local Storage ---
    // Safely retrieves and parses an item from localStorage
    const getStorage = (key) => JSON.parse(localStorage.getItem(key) || '[]');
    // Safely saves an item to localStorage
    const saveStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));


    // =======================================================
    // 1 & 2. Wishlist and Cart Functionality (product.html)
    // =======================================================

    const productCards = document.querySelectorAll('.product-grid .product-card');

    productCards.forEach(card => {
        const productId = card.dataset.productId;
        const productName = card.dataset.productName;
        // Price cleanup: remove '₹' and parse as a number
        const productPrice = parseFloat(card.dataset.productPrice); 
        // *** NEW/FIXED: Get the image path from the data attribute ***
        const productImage = card.dataset.productImage; 
        
        if (!productId) return; // Skip cards without product data

        const wishlistIcon = card.querySelector('.wishlist-icon');
        const addToCartBtn = card.querySelector('.add-to-cart-btn');

        // --- Wishlist Logic (Heart Icon) ---
        if (wishlistIcon) {
            // Check initial state on page load
            let wishlist = getStorage('wishlist');
            if (wishlist.some(item => item.id === productId)) {
                wishlistIcon.style.color = 'red'; // Indicate it's already in the list
            }

            wishlistIcon.addEventListener('click', () => {
                wishlist = getStorage('wishlist');
                const existingIndex = wishlist.findIndex(item => item.id === productId);

                if (existingIndex > -1) {
                    // Remove from wishlist
                    wishlist.splice(existingIndex, 1);
                    wishlistIcon.style.color = '#c2185b'; 
                    alert(`${productName} removed from Wishlist!`);
                } else {
                    // Add to wishlist
                    // *** UPDATED: Including 'image' property ***
                    const product = { id: productId, name: productName, price: productPrice, image: productImage };
                    wishlist.push(product);
                    wishlistIcon.style.color = 'red';
                    alert(`${productName} added to Wishlist!`);
                }
                saveStorage('wishlist', wishlist);
            });
        }

        // --- Cart Logic (Add to Cart Button) ---
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                let cart = getStorage('shoppingCart');
                const existingItem = cart.find(item => item.id === productId);

                if (existingItem) {
                    existingItem.quantity += 1; // Increase quantity
                    alert(`Added another ${productName} to Cart! (Quantity: ${existingItem.quantity})`);
                } else {
                    // *** UPDATED: Including 'image' property in cart data ***
                    const product = { id: productId, name: productName, price: productPrice, quantity: 1, image: productImage };
                    cart.push(product);
                    alert(`${productName} added to Cart!`);
                }
                saveStorage('shoppingCart', cart);
            });
        }
    });


    // =======================================================
    // 1. Render Wishlist Page (wishlist.html)
    // =======================================================
    const wishlistContainer = document.getElementById('wishlist-items');

    if (wishlistContainer) {
        function renderWishlist() {
            const wishlist = getStorage('wishlist');
            wishlistContainer.innerHTML = ''; // Clear previous content

            if (wishlist.length === 0) {
                wishlistContainer.innerHTML = '<p style="text-align: center; font-size: 1.2rem; margin-top: 50px; color: #444;">Your wishlist is empty. Start adding some lovely blooms! 🌸</p>';
                return;
            }

            // Simple container style for the wishlist
            wishlistContainer.style.display = 'grid';
            wishlistContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
            wishlistContainer.style.gap = '20px';
            wishlistContainer.style.padding = '20px';

            wishlist.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('wishlist-item', 'product-card'); 
                itemElement.style.position = 'relative'; // Allows absolute positioning inside
                // *** UPDATED: Added the <img> tag using item.image ***
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px; margin-bottom: 10px;">
                    <h3>${item.name}</h3>
                    <p>Price: ₹${item.price.toFixed(2)}</p>
                    <button class="btn remove-wish-btn" data-id="${item.id}" 
                            style="background: #e60073; margin-top: 10px;">Remove</button>
                    <i class="fas fa-heart" style="position: absolute; top: 15px; right: 15px; color: red; font-size: 1.5rem;"></i>
                `;
                wishlistContainer.appendChild(itemElement);
            });
            
            // Add listeners for removal buttons
            document.querySelectorAll('.remove-wish-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const itemId = e.target.dataset.id;
                    let currentWishlist = getStorage('wishlist');
                    const newWishlist = currentWishlist.filter(item => item.id !== itemId);
                    saveStorage('wishlist', newWishlist);
                    renderWishlist(); // Re-render the list
                });
            });
        }
        renderWishlist();
    }


    // =======================================================
    // 2. Render Cart Page (cart.html)
    // =======================================================
    const cartContainer = document.getElementById('cart-items');

    if (cartContainer) {
        function renderCart() {
            const cart = getStorage('shoppingCart');
            cartContainer.innerHTML = '';
            let total = 0;

            if (cart.length === 0) {
                cartContainer.innerHTML = '<p style="text-align: center; font-size: 1.2rem; margin-top: 50px; color: #444;">Your shopping cart is empty. 🛒</p>';
                return;
            }

            // Create a responsive grid for cart items
            cartContainer.style.display = 'grid';
            cartContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
            cartContainer.style.gap = '20px';
            cartContainer.style.padding = '20px';


            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item', 'product-card'); // Reusing product-card style
                // *** UPDATED: Added the <img> tag using item.image ***
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px; margin-bottom: 10px;">
                    <h3>${item.name}</h3>
                    <p>Price: ₹${item.price.toFixed(2)}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p style="font-weight: bold; color: #d63384;">Subtotal: ₹${itemTotal.toFixed(2)}</p>
                    <button class="btn remove-cart-btn" data-id="${item.id}" style="background: #444;">Remove</button>
                `;
                cartContainer.appendChild(itemElement);
            });

            // Display Total and Clear Button
            const summaryElement = document.createElement('div');
            summaryElement.style.gridColumn = '1 / -1'; 
            summaryElement.style.textAlign = 'right';
            summaryElement.style.paddingTop = '20px';
            summaryElement.innerHTML = `
                <hr style="margin-top: 20px;">
                <h2 style="color: #d63384; margin: 15px 0;">Grand Total: ₹${total.toFixed(2)}</h2>
                <button id="clear-cart-btn" class="btn" style="background: #e60073;">Clear Cart</button>
            `;
            cartContainer.appendChild(summaryElement);

            // Add clear cart listener
            document.getElementById('clear-cart-btn').addEventListener('click', () => {
                localStorage.removeItem('shoppingCart');
                renderCart();
            });
            
             // Add listeners for item removal
            document.querySelectorAll('.remove-cart-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const itemId = e.target.dataset.id;
                    let currentCart = getStorage('shoppingCart');
                    const newCart = currentCart.filter(item => item.id !== itemId);
                    saveStorage('shoppingCart', newCart);
                    renderCart(); // Re-render the list
                });
            });
        }
        renderCart();
    }


    // =======================================================
    // 3. Review Submission and Display (review.html)
    // =======================================================
    const reviewForm = document.getElementById('new-review-form');
    const reviewsListContainer = document.getElementById('reviews-list');

    if (reviewForm && reviewsListContainer) {
        
        // Load and display persisted reviews
        const persistedReviews = getStorage('userReviews');
        persistedReviews.forEach(review => {
            const newReviewCard = document.createElement('div');
            newReviewCard.classList.add('review-card');
            newReviewCard.innerHTML = `<p>"${review.text}"</p><h4>- ${review.author}</h4>`;
            reviewsListContainer.prepend(newReviewCard); // Add new reviews to the top
        });

        reviewForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Stop page refresh

            const authorInput = document.getElementById('review-author');
            const reviewTextInput = document.getElementById('review-text');

            const author = authorInput.value.trim() || 'Anonymous Customer';
            const text = reviewTextInput.value.trim();

            if (text === "") {
                alert("Please write a review before submitting.");
                return;
            }

            // 1. Create and display the new review instantly
            const newReviewCard = document.createElement('div');
            newReviewCard.classList.add('review-card');
            newReviewCard.innerHTML = `<p>"${text}"</p><h4>- ${author}</h4>`;
            reviewsListContainer.prepend(newReviewCard); // Add to the top of the grid

            // 2. Store in Local Storage
            const newReviewData = { author: author, text: text };
            const currentReviews = getStorage('userReviews');
            currentReviews.push(newReviewData);
            saveStorage('userReviews', currentReviews);

            // Clear the form
            reviewForm.reset();
            alert("Your review has been submitted and saved!");
        });
    }


    // =======================================================
    // 4. Contact Form Storage (contact.html)
    // =======================================================
    const contactForm = document.getElementById('contact-us-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Stop page refresh

            const name = document.getElementById('contact-name').value.trim();
            const phone = document.getElementById('contact-phone').value.trim();
            const message = document.getElementById('contact-message').value.trim();

            const contacts = getStorage('contacts');

            const newContact = {
                id: Date.now(), // Unique ID
                name: name,
                phone: phone,
                message: message,
                date: new Date().toLocaleString()
            };

            contacts.push(newContact);
            saveStorage('contacts', contacts);

            alert("Thank you for your message! Your contact details have been stored locally.");
            contactForm.reset();
        });
    }


    // =======================================================
    // 5. Login Details Storage (login.html)
    // =======================================================
    const loginForm = document.getElementById('login-user-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            // *** SECURITY WARNING: STORING PASSWORDS IN LOCAL STORAGE IS INSECURE. ***
            // This is for front-end demo only as requested.
            
            const loginData = {
                email: email,
                password: password, 
                loginTime: new Date().toISOString()
            };

            // Save the details (will overwrite any previous login)
            localStorage.setItem('lastLoginAttempt', JSON.stringify(loginData));

            alert(`Login simulated for: ${email}. Details stored in Local Storage.`);
            // Optional: Redirect the user after successful "login"
            // window.location.href = 'index.html'; 
        });
    }
});