// DOM Elements
const categoryList = document.getElementById('category-list');
const toolsContainer = document.getElementById('tools-container');
const currentCategory = document.getElementById('current-category');
const categoryCount = document.getElementById('category-count');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const addToolBtn = document.getElementById('add-tool-btn');
const editModeBtn = document.getElementById('edit-mode-btn');
const viewToggle = document.getElementById('view-toggle');
const toolModal = document.getElementById('tool-modal');
const toolForm = document.getElementById('tool-form');
const toolCategorySelect = document.getElementById('tool-category');
const closeModalBtns = document.querySelectorAll('.close-modal');
const emojiOptions = document.querySelectorAll('.emoji-option');

// State
let activeCategory = 'all';
let editMode = false;
let searchQuery = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initCategories();
    initTools();
    initEventListeners();
    updateCategoryCount();
});

// Initialize Categories
function initCategories() {
    categoryList.innerHTML = '';
    
    // Add "All" category
    const allCategory = appData.categories.find(c => c.id === 'all');
    const allItem = createCategoryElement(allCategory, appData.tools.length);
    categoryList.appendChild(allItem);
    
    // Add other categories
    appData.categories
        .filter(c => c.id !== 'all')
        .forEach(category => {
            const count = appData.tools.filter(tool => tool.category === category.id).length;
            const categoryElement = createCategoryElement(category, count);
            categoryList.appendChild(categoryElement);
        });
}

// Create Category Element
function createCategoryElement(category, count) {
    const li = document.createElement('li');
    li.className = `category-item ${category.id === activeCategory ? 'active' : ''}`;
    li.dataset.category = category.id;
    
    li.innerHTML = `
        <span class="category-emoji">${category.emoji}</span>
        <span class="category-name">${category.name}</span>
        <span class="category-count">${count}</span>
    `;
    
    li.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        li.classList.add('active');
        activeCategory = category.id;
        currentCategory.textContent = category.name;
        initTools();
        updateCategoryCount();
    });
    
    return li;
}

// Initialize Tools
function initTools() {
    toolsContainer.innerHTML = '';
    
    let filteredTools = appData.tools;
    
    // Filter by category
    if (activeCategory !== 'all') {
        filteredTools = filteredTools.filter(tool => tool.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredTools = filteredTools.filter(tool => 
            tool.name.toLowerCase().includes(query) || 
            tool.description.toLowerCase().includes(query)
        );
    }
    
    // Display tools or empty state
    if (filteredTools.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No tools found</h3>
            <p>${searchQuery ? 'Try a different search term' : 'No tools available in this category'}</p>
        `;
        toolsContainer.appendChild(emptyState);
    } else {
        filteredTools.forEach(tool => {
            const category = appData.categories.find(c => c.id === tool.category);
            const toolElement = createToolElement(tool, category);
            toolsContainer.appendChild(toolElement);
        });
    }
    
    // Toggle edit mode
    if (editMode) {
        document.body.classList.add('edit-mode');
    } else {
        document.body.classList.remove('edit-mode');
    }
}

// Create Tool Element
function createToolElement(tool, category) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.dataset.id = tool.id;
    
    card.innerHTML = `
        <div class="tool-card-header">
            <div class="tool-emoji">${tool.emoji}</div>
            <div class="tool-info">
                <h3>${tool.name}</h3>
                <span class="tool-category" style="color: ${category.color}">${category.name}</span>
            </div>
        </div>
        <p class="tool-description">${tool.description}</p>
        <div class="tool-actions">
            <a href="${tool.link}" class="btn-link" target="_blank">
                <i class="fas fa-external-link-alt"></i>
                Open Tool
            </a>
            <div class="tool-edit-btns">
                <button class="btn-edit" data-id="${tool.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${tool.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Update Category Count
function updateCategoryCount() {
    let filteredTools = appData.tools;
    
    if (activeCategory !== 'all') {
        filteredTools = filteredTools.filter(tool => tool.category === activeCategory);
    }
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredTools = filteredTools.filter(tool => 
            tool.name.toLowerCase().includes(query) || 
            tool.description.toLowerCase().includes(query)
        );
    }
    
    categoryCount.textContent = `${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''} available`;
}

// Initialize Event Listeners
function initEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        initTools();
        updateCategoryCount();
    });
    
    // Theme toggle
    themeToggle.addEventListener('change', () => {
        const theme = themeToggle.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
    
    // Edit mode toggle
    editModeBtn.addEventListener('click', () => {
        editMode = !editMode;
        editModeBtn.innerHTML = editMode ? 
            '<i class="fas fa-check"></i>' : 
            '<i class="fas fa-edit"></i>';
        initTools();
    });
    
    // View toggle
    viewToggle.addEventListener('click', () => {
        const isGrid = toolsContainer.style.gridTemplateColumns.includes('minmax');
        if (isGrid) {
            toolsContainer.style.gridTemplateColumns = '1fr';
            viewToggle.innerHTML = '<i class="fas fa-th-list"></i>';
        } else {
            toolsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            viewToggle.innerHTML = '<i class="fas fa-th-large"></i>';
        }
    });
    
    // Add tool button
    addToolBtn.addEventListener('click', () => {
        openToolModal();
    });
    
    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolModal.classList.remove('active');
        });
    });
    
    // Emoji selection
    emojiOptions.forEach(option => {
        option.addEventListener('click', () => {
            document.getElementById('tool-icon').value = option.dataset.emoji;
        });
    });
    
    // Tool form submission
    toolForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTool();
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === toolModal) {
            toolModal.classList.remove('active');
        }
    });
    
    // Event delegation for edit/delete buttons
    toolsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.btn-delete')) {
            const id = parseInt(e.target.closest('.btn-delete').dataset.id);
            deleteTool(id);
        }
        
        if (e.target.closest('.btn-edit')) {
            const id = parseInt(e.target.closest('.btn-edit').dataset.id);
            editTool(id);
        }
    });
}

// Open Tool Modal
function openToolModal(tool = null) {
    // Populate category select
    toolCategorySelect.innerHTML = '';
    appData.categories
        .filter(c => c.id !== 'all')
        .forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.emoji} ${category.name}`;
            toolCategorySelect.appendChild(option);
        });
    
    if (tool) {
        // Edit mode
        document.querySelector('.modal-header h3').textContent = 'Edit Tool';
        document.getElementById('tool-name').value = tool.name;
        document.getElementById('tool-description').value = tool.description;
        document.getElementById('tool-category').value = tool.category;
        document.getElementById('tool-link').value = tool.link;
        document.getElementById('tool-icon').value = tool.emoji;
        toolForm.dataset.editId = tool.id;
    } else {
        // Add mode
        document.querySelector('.modal-header h3').textContent = 'Add New Tool';
        toolForm.reset();
        delete toolForm.dataset.editId;
    }
    
    toolModal.classList.add('active');
}

// Save Tool
function saveTool() {
    const name = document.getElementById('tool-name').value;
    const description = document.getElementById('tool-description').value;
    const category = document.getElementById('tool-category').value;
    const link = document.getElementById('tool-link').value;
    const emoji = document.getElementById('tool-icon').value || '🔧';
    
    if (toolForm.dataset.editId) {
        // Update existing tool
        const id = parseInt(toolForm.dataset.editId);
        const index = appData.tools.findIndex(t => t.id === id);
        if (index !== -1) {
            appData.tools[index] = {
                ...appData.tools[index],
                name,
                description,
                category,
                link,
                emoji
            };
        }
    } else {
        // Add new tool
        const newId = Math.max(...appData.tools.map(t => t.id)) + 1;
        appData.tools.push({
            id: newId,
            name,
            description,
            category,
            link,
            emoji,
            featured: false
        });
    }
    
    toolModal.classList.remove('active');
    initCategories();
    initTools();
    updateCategoryCount();
}

// Delete Tool
function deleteTool(id) {
    if (confirm('Are you sure you want to delete this tool?')) {
        const index = appData.tools.findIndex(t => t.id === id);
        if (index !== -1) {
            appData.tools.splice(index, 1);
            initCategories();
            initTools();
            updateCategoryCount();
        }
    }
}

// Edit Tool
function editTool(id) {
    const tool = appData.tools.find(t => t.id === id);
    if (tool) {
        openToolModal(tool);
    }
}
