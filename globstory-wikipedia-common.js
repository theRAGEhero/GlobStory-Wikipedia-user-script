// GlobStory Wikipedia Integration for common.js
mw.loader.using(['mediawiki.util', 'mediawiki.api'], function() {
    mw.hook('wikipage.content').add(function($content) {
        'use strict';

        // Check if the script has already been executed
        if (window.globStoryInitialized) {
            return;
        }
        window.globStoryInitialized = true;

        // Main function to initialize GlobStory
        var initGlobStory = function() {
        
        // Create and add CSS
        const style = document.createElement('style');
        style.textContent = `
            /* Main container styles */
            .globstory-container {
                position: fixed;
                right: 0;
                top: 0;
                height: 100vh;
                width: 30%;
                background: white;
                box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                transition: width 0.3s ease;
            }
            
            /* Collapsed state */
            .globstory-container.collapsed {
                width: 40px;
            }
            
            /* Adjust Wikipedia content when map is shown */
            .globstory-active #content {
                margin-right: 30%;
                transition: margin-right 0.3s ease;
                width: auto !important;
            }
            
            .globstory-active.collapsed #content {
                margin-right: 40px;
                width: auto !important;
            }
            
            /* Ensure content is responsive when tool is hidden */
            .globstory-active #content,
            .globstory-active.collapsed #content {
                max-width: calc(100% - 40px);
                box-sizing: border-box;
            }

            /* Adjust content padding when map is collapsed */
            .globstory-active.collapsed #mw-content-text {
                padding-right: 40px;
            }

            /* Ensure the toggle button doesn't overlap content */
            .globstory-container.collapsed .globstory-toggle {
                z-index: 1001;
            }
            
            /* Toggle button */
            .globstory-toggle {
                position: absolute;
                left: -40px;
                top: 50%;
                background: #007BFF;
                color: white;
                width: 40px;
                height: 80px;
                border: none;
                border-radius: 5px 0 0 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
            }
            
            /* Toggle button on hover */
            .globstory-toggle:hover {
                background: #0056b3;
            }
            
            /* Map container */
            .globstory-map {
                flex: 1;
                border: none;
                width: 100%;
            }
            
            /* Controls bar */
            .globstory-controls {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                background-color: #f1f1f1;
                border-bottom: 1px solid #ddd;
            }
            
            /* Control buttons */
            .globstory-btn {
                padding: 6px 10px;
                margin: 0 3px;
                background-color: #007BFF;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .globstory-btn:hover {
                background-color: #0056b3;
            }
            
            /* Year input */
            .globstory-year-input {
                padding: 6px;
                width: 70px;
                text-align: center;
                border: 1px solid #ccc;
                border-radius: 4px;
                margin: 0 5px;
            }
            
            /* Help button */
            .globstory-help {
                position: absolute;
                top: 8px;
                right: 8px;
                background: #FFA500;
                color: white;
                width: 30px;
                height: 30px;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            
            /* Help modal */
            .globstory-help-modal {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(0,0,0,0.2);
                z-index: 1200;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .globstory-help-modal.active {
                display: block;
            }
            
            /* Modal overlay */
            .globstory-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 1100;
            }
            
            .globstory-overlay.active {
                display: block;
            }
            
            /* Close button for modal */
            .globstory-close {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                color: #333;
            }
            
            /* Highlighted text */
            .globstory-country {
                background-color: #ffff9980;
                cursor: pointer;
                padding: 0 2px;
                border-radius: 2px;
            }
            
            .globstory-year {
                background-color: #90ee9080;
                cursor: pointer;
                padding: 0 2px;
                border-radius: 2px;
            }
            
            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .globstory-container {
                    width: 100%;
                    height: 50vh;
                    bottom: 0;
                    top: auto;
                    right: 0;
                }
                
                .globstory-container.collapsed {
                    height: 40px;
                    width: 100%;
                }
                
                .globstory-toggle {
                    top: -40px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80px;
                    height: 40px;
                    border-radius: 5px 5px 0 0;
                }
                
                .globstory-active #content {
                    margin-right: 0;
                    margin-bottom: 50vh;
                }
                
                .globstory-active.collapsed #content {
                    margin-bottom: 40px;
                    margin-right: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Create main container
        const container = document.createElement('div');
        container.className = 'globstory-container';
        container.id = 'globstory-container';
        
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'globstory-toggle';
        toggleBtn.innerHTML = '&laquo;';
        toggleBtn.title = 'Toggle GlobStory Map';
        container.appendChild(toggleBtn);
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'globstory-controls';
        
        // Year navigation buttons
        const yearMinus100 = createButton('<<', 'Jump 100 years back');
        const yearMinus10 = createButton('<', 'Jump 10 years back');
        const yearInput = document.createElement('input');
        yearInput.type = 'number';
        yearInput.className = 'globstory-year-input';
        yearInput.value = new Date().getFullYear();
        const yearPlus10 = createButton('>', 'Jump 10 years forward');
        const yearPlus100 = createButton('>>', 'Jump 100 years forward');
        
        // Help button
        const helpBtn = document.createElement('button');
        helpBtn.className = 'globstory-help';
        helpBtn.innerHTML = '?';
        helpBtn.title = 'GlobStory Help';
        
        // Append controls
        controls.appendChild(yearMinus100);
        controls.appendChild(yearMinus10);
        controls.appendChild(yearInput);
        controls.appendChild(yearPlus10);
        controls.appendChild(yearPlus100);
        controls.appendChild(helpBtn);
        container.appendChild(controls);
        
        // Create map iframe
        const mapIframe = document.createElement('iframe');
        mapIframe.className = 'globstory-map';
        mapIframe.src = `https://embed.openhistoricalmap.org/#map=3/43.021/7.471&layers=O&date=${new Date().getFullYear()}-12-08`;
        mapIframe.frameBorder = '0';
        mapIframe.scrolling = 'no';
        container.appendChild(mapIframe);
        
        // Create help modal
        const helpModal = document.createElement('div');
        helpModal.className = 'globstory-help-modal';
        helpModal.innerHTML = `
            <span class="globstory-close">&times;</span>
            <h2>Welcome to GlobStory Wikipedia Integration</h2>
            <p>This extension enhances your Wikipedia experience by adding an interactive historical map that dynamically responds to content.</p>
            
            <h3>How to use:</h3>
            <ul>
                <li><strong>Highlighted Elements:</strong>
                    <ul>
                        <li>Country and place names are highlighted in <span style="background-color: #ffff9980;">yellow</span></li>
                        <li>Years and dates are highlighted in <span style="background-color: #90ee9080;">green</span></li>
                        <li>Hover over highlighted text for 1 second to see the corresponding location or time period on the map</li>
                    </ul>
                </li>
                <li><strong>Map Navigation:</strong>
                    <ul>
                        <li>Use the year controls to navigate through different time periods</li>
                        <li>The map will update to show historical borders for the selected year</li>
                    </ul>
                </li>
                <li><strong>Toggle the Map:</strong>
                    <ul>
                        <li>Click the toggle button to hide or show the map sidebar</li>
                    </ul>
                </li>
            </ul>
            
            <p>To learn more about GlobStory, visit <a href="https://globstory.it" target="_blank">globstory.it</a></p>
        `;
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'globstory-overlay';
        
        // Add elements to the page
        document.body.appendChild(container);
        document.body.appendChild(helpModal);
        document.body.appendChild(overlay);
        
        // Add the 'globstory-active' class to the body
        document.body.classList.add('globstory-active');
        
        // Initialize hover functionality for country and year detection
        initializeHighlighting();
        
        // Event listeners
        toggleBtn.addEventListener('click', toggleMap);
        yearMinus100.addEventListener('click', () => adjustYear(-100));
        yearMinus10.addEventListener('click', () => adjustYear(-10));
        yearPlus10.addEventListener('click', () => adjustYear(10));
        yearPlus100.addEventListener('click', () => adjustYear(100));
        
        yearInput.addEventListener('change', () => {
            const year = parseInt(yearInput.value, 10);
            updateMapYear(year);
        });
        
        helpBtn.addEventListener('click', () => {
            helpModal.classList.add('active');
            overlay.classList.add('active');
        });
        
        document.querySelector('.globstory-close').addEventListener('click', closeHelp);
        overlay.addEventListener('click', closeHelp);
        
        // Helper functions
        function createButton(text, title) {
            const button = document.createElement('button');
            button.className = 'globstory-btn';
            button.textContent = text;
            button.title = title;
            return button;
        }
        
        function toggleMap() {
            container.classList.toggle('collapsed');
            document.body.classList.toggle('collapsed');
            
            if (container.classList.contains('collapsed')) {
                toggleBtn.innerHTML = '&raquo;';
            } else {
                toggleBtn.innerHTML = '&laquo;';
            }
        }
        
        function adjustYear(delta) {
            const currentYear = parseInt(yearInput.value, 10);
            const newYear = currentYear + delta;
            yearInput.value = newYear;
            updateMapYear(newYear);
        }
        
        function updateMapYear(year) {
            // Extract current map position and zoom level from iframe
            const src = mapIframe.src;
            const hashParams = src.split('#')[1].split('&');
            let mapZoom = "3"; // Default zoom level
            let mapLat = "43.021"; // Default latitude
            let mapLon = "7.471"; // Default longitude
            
            hashParams.forEach(param => {
                if (param.startsWith("map=")) {
                    const mapValues = param.split("=")[1].split("/");
                    mapZoom = mapValues[0];
                    mapLat = mapValues[1];
                    mapLon = mapValues[2];
                }
            });
            
            // Save the current map state
            const currentMapState = `map=${mapZoom}/${mapLat}/${mapLon}`;
            
            // Update the iframe with the saved state and new date
            mapIframe.src = `https://embed.openhistoricalmap.org/#${currentMapState}&layers=O&date=${year}-12-08`;
        }
        
        function closeHelp() {
            helpModal.classList.remove('active');
            overlay.classList.remove('active');
        }
        
        function initializeHighlighting() {
            // Select all paragraph elements in the content
            const contentElement = document.getElementById('mw-content-text');
            if (!contentElement) return;
            
            const paragraphs = contentElement.querySelectorAll('p');
            
            paragraphs.forEach(paragraph => {
                // Create a temporary container
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = paragraph.innerHTML;
                
                // Process text nodes only
                const walker = document.createTreeWalker(tempContainer, NodeFilter.SHOW_TEXT, null, false);
                let node;
                const nodesToReplace = [];
                
                while (node = walker.nextNode()) {
                    const newNode = document.createElement('span');
                    newNode.innerHTML = node.textContent
                        // Highlight country names (capitalized words)
                        .replace(/\b([A-Z][a-z]{3,})\b/g, '<span class="globstory-country" data-country="$1">$1</span>')
                        // Highlight years (4-digit numbers between 1000-2099)
                        .replace(/\b(1[0-9]{3}|20[0-9]{2})\b/g, '<span class="globstory-year" data-year="$1">$1</span>');
                    
                    nodesToReplace.push({oldNode: node, newNode: newNode});
                }
                
                // Replace nodes
                nodesToReplace.forEach(({oldNode, newNode}) => {
                    oldNode.parentNode.replaceChild(newNode, oldNode);
                });
                
                // Update paragraph content
                paragraph.innerHTML = tempContainer.innerHTML;
            });
            
            // Add hover functionality for highlighted elements
            let hoverTimeout;
            
            contentElement.addEventListener('mouseover', e => {
                const target = e.target;
                
                if (target.classList.contains('globstory-country') || target.classList.contains('globstory-year')) {
                    clearTimeout(hoverTimeout);
                    
                    hoverTimeout = setTimeout(() => {
                        if (target.classList.contains('globstory-country')) {
                            // Handle country hover
                            const countryName = target.dataset.country;
                            updateMapLocation(countryName);
                        } else if (target.classList.contains('globstory-year')) {
                            // Handle year hover
                            const year = parseInt(target.dataset.year, 10);
                            yearInput.value = year;
                            updateMapYear(year);
                        }
                    }, 1000); // Trigger after 1 second hover
                }
            });
            
            contentElement.addEventListener('mouseout', () => {
                clearTimeout(hoverTimeout);
            });
        }
        
        function updateMapLocation(placeName) {
            // Use MediaWiki API to fetch coordinates
            new mw.Api().get({
                action: 'query',
                prop: 'coordinates',
                titles: placeName,
                format: 'json'
            }).done(function(data) {
                var pages = data.query.pages;
                var pageId = Object.keys(pages)[0];
                var page = pages[pageId];
                
                if (page.coordinates) {
                    var lat = page.coordinates[0].lat;
                    var lon = page.coordinates[0].lon;
                    var mapZoom = 6; // Default zoom level
                    
                    // Get current year from input
                    var currentYear = yearInput.value;
                    
                    // Update the map iframe with new coordinates, zoom level, and year
                    mapIframe.src = 'https://embed.openhistoricalmap.org/#map=' + mapZoom + '/' + lat + '/' + lon + '&layers=O&date=' + currentYear + '-12-08';
                }
            }).fail(function() {
                console.error("Error fetching location coordinates for: " + placeName);
            });
        }
        }; // End of initGlobStory function

        // Run the initialization
        initGlobStory();
    });
});
