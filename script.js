document.getElementById('visualize-btn').addEventListener('click', function() {
    const input = document.getElementById('terraform-input').value;
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';
    
    if (!input.trim()) {
        outputDiv.textContent = 'Please enter Terraform plan output';
        return;
    }
    
    const lines = input.split('\n');
    let currentBlock = null;
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        // Check for resource blocks
        if (line.startsWith('#') && (line.includes('will be created') || 
                                     line.includes('will be updated') || 
                                     line.includes('will be destroyed') || 
                                     line.includes('must be replaced'))) {
            // Close previous block if exists
            if (currentBlock) {
                outputDiv.appendChild(currentBlock);
            }
            
            // Create new block
            currentBlock = document.createElement('div');
            
            // Determine block type
            if (line.includes('created')) {
                currentBlock.className = 'resource-block create';
            } else if (line.includes('updated')) {
                currentBlock.className = 'resource-block update';
            } else if (line.includes('destroyed')) {
                currentBlock.className = 'resource-block destroy';
            } else if (line.includes('replaced')) {
                currentBlock.className = 'resource-block replace';
            }
            
            // Add header
            const header = document.createElement('h3');
            header.textContent = line;
            currentBlock.appendChild(header);
        } 
        // Check for resource details
        else if (line.startsWith('resource "') && currentBlock) {
            const resourceLine = document.createElement('div');
            resourceLine.textContent = line;
            currentBlock.appendChild(resourceLine);
        }
        // Check for changes
        else if ((line.startsWith('+') || line.startsWith('-') || line.includes('->')) {
            if (!currentBlock) return;
            
            const changeLine = document.createElement('div');
            changeLine.className = 'change-line';
            
            // Handle simple changes (old -> new)
            if (line.includes('->')) {
                const parts = line.split('->').map(p => p.trim());
                const beforeArrow = parts[0];
                const afterArrow = parts[1];
                
                const spanBefore = document.createElement('span');
                spanBefore.className = 'old-value';
                spanBefore.textContent = beforeArrow;
                
                const spanArrow = document.createElement('span');
                spanArrow.className = 'arrow';
                spanArrow.textContent = ' → ';
                
                const spanAfter = document.createElement('span');
                spanAfter.className = 'new-value';
                spanAfter.textContent = afterArrow;
                
                changeLine.appendChild(spanBefore);
                changeLine.appendChild(spanArrow);
                changeLine.appendChild(spanAfter);
            } else {
                changeLine.textContent = line;
            }
            
            currentBlock.appendChild(changeLine);
        }
    });
    
    // Add the last block if exists
    if (currentBlock) {
        outputDiv.appendChild(currentBlock);
    }
});
