function generateAuthString(password) {
    const timestamp = new Date().toISOString().slice(0,10).replace(/-/g,"");
    const authString = password + "_" + timestamp;
    return md5(authString);
}

const password = "Valantis";
const authString = generateAuthString(password);
console.log(authString);

const requestData = {
    action: 'get_ids',
    params: { offset: 0, limit: 10 }
};

const headers = {
    'Content-Type': 'application/json',
    'X-Auth': authString
};

try {
    const response = await fetch('https://api.valantis.store:41000/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
    });

    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    console.log(data);
    displayProducts(data.result);
} catch (error) {
    console.error('Error fetching products:', error);
}

// ++++++++++


async function loadProducts(offset = 0, limit = 50, filters = {}) {
    const requestData = {
        action: 'get_ids',
        params: { offset, limit }
    };

    try {
        return await fetchData(requestData);
    } catch (error) {
        console.error('Error loading products:', error);
        throw new Error('Failed to load products');
    }
}

// Функция для отправки запроса к API
async function fetchData(requestData) {
    try {
        const response = await fetch('https://api.valantis.store:41000/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth': authString
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

const products = [];

async function displayProducts(productIds) {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';

    try {
        productIds.forEach(async productId => {
            try {
                const product = await getDetailedProduct(productId);
                products.push(product);
                const productElement = document.createElement('div');
                productElement.innerHTML = `
                    <p><strong>ID:</strong> ${product.id}</p>
                    <p><strong>Product:</strong> ${product.product}</p>
                    <p><strong>Brand:</strong> ${product.brand}</p>
                    <p><strong>Price:</strong> ${product.price}</p>
                `;
                productsContainer.appendChild(productElement);
            } catch (error) {
                console.error('Error displaying product with ID', productId, ':', error);
            }
        });
    } catch (error) {
        console.error('Error displaying products:', error);
        document.getElementById('error-message').textContent = error.message;
    }
}

async function getDetailedProduct(productId) {
    const requestData = {
        action: 'get_items',
        params: { ids: [productId] }
    };

    try {
        const response = await fetchData(requestData);
        return response.result[0];
    } catch (error) {
        console.error('Error getting detailed product with ID', productId, ':', error);
        throw new Error('Failed to get detailed product with ID ' + productId);
    }
}


// ++++++++++++++++++++++++++


const PRODUCTS_PER_PAGE = 50;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  loadProducts(currentPage);

  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadProducts(currentPage);
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadProducts(currentPage);
  });
});
