// Declaring variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
// This array will hold cart information
let cart = [];
//buttons
let buttonsDOM = [];

// Getting products 1. From products.Json 
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                // Getting title and price, destructering the items (object)
                const {title, price, category} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, category, id, image}
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// Display Products (getting items returned from products class and returning them)
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `
            <arcticle class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img"/>
                    <button class="bag-btn" data-id=${product.id}>
                        <i class='fas fa-shopping-cart'></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </arcticle>
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            // Checks if item is already in the cart, and then informs user and disables button
            let inCart = cart.find(item => item.id === id)
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                /* get product from products, add that product to the cart, save cart in local storage,
                set cart values, display cart item, and show the cart (in order)*/
                let cartItem = {...Storage.getProduct(id), amount:1}; //amount is incrementing value
                cart = [...cart, cartItem];
                Storage.saveCart(cart);
                this.setCartValues(cart);
                this.addCartItem(cartItem);
                this.showCart();
            });
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="product" />
                    <div>
                        <h4>${item.title}</h4>
                        <h5> $${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div> `;
                    cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add("transparent");
        cartDOM.classList.add("showCart");
    }
    setupAPP () {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove("transparent");
        cartDOM.classList.remove("showCart");
    }
    //select clear cart button, and increase/decrease amount of item
    cartLogic () {
        clearCartBtn.addEventListener('click', () => {this.clearCart();
    });
    // Cart functionality (place holder)
    cartContent.addEventListener('click', event => {
        if (event.target.classList.contains(".remove-item"))
        {
            let removeItem = event.target;
            let id = removeItem.dataset.id;
            cartContent.removeChild(removeItem.prentElement.parentElement); // parent of the parent
            this.removeItem(id);
        } else if (event.target.classList.contains("fa-chevron-up")) {
            let addAmount = event.target;
            let id = addAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount + 1;
            Storage.saveCart(cart);
            this.setCartValues(cart);
            addAmount.nextElementSibling.innerText = tempItem.amount;
        } else if (event.target.classList.contains("fa-chevron-down")) {
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount - 1;
            if (tempItem.amount > 0) {
                Storage.saveCart(cart);
                this.setCartValues(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount;
            } else {
                cartContent.removeChild(lowerAmount.parentElement.parentElement);
                this.removeItem(id);
            }
        }
    });
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        // While cart content.children (the product item) is removed, then remove that item from the DOM array
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !==id)
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML =  `<i class="fas fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(id) {
        // gets specific button assigned to added that item to the cart
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}


// Local Storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        // Checks if id matches and stores the selected product in local storage
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // setup App
    ui.setupAPP();
    // get all products
    products.getProducts().then(products => { 
        ui.displayProducts(products)
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons(); 
        ui.cartLogic();
    });
});

// Code below is for the sidebar
const toggleBtn = document.querySelector(".sidebar-toggle");
const closeBtn = document.querySelector(".close-btn");
const sidebar = document.querySelector(".sidebar");

toggleBtn.addEventListener('click', function() {
    if (sidebar.classList.contains("show-sidebar")) {
        sidebar.classList.remove("show-sidebar");
    } else {
        sidebar.classList.add("show-sidebar");
    }
});

closeBtn.addEventListener('click', function() {
    sidebar.classList.remove("show-sidebar");
});

// code below is for paralax Function
let controller = new ScrollMagic.Controller();
let timeline = new TimelineMax();

timeline
    .to(".rock", 6, {y: -250})
    .to(".girl", 6, {y: -200}, '-=3')
    .fromTo(".bg1", 3, {y: -50}, { y: 0}, '-=3')
    .to(".content", 3, {top: "0%"}, '-=3')
    .fromTo(".content-images", {opacity: 0}, {opacity: 1, duration: 3});

let scene = new ScrollMagic.Scene({
    triggerElement: ".para",
    duration: "200%",
    triggerHook: 0,
})
    .setTween(timeline)
    .setPin(".para")
    .addTo(controller)