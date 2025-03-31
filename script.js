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
        
        // 解析资源块（创建/更新/销毁/替换）
        if (line.startsWith('#') && (line.includes('will be created') || 
                                     line.includes('will be updated') || 
                                     line.includes('will be destroyed') || 
                                     line.includes('must be replaced'))) {
            if (currentBlock) outputDiv.appendChild(currentBlock);
            
            currentBlock = document.createElement('div');
            if (line.includes('created')) currentBlock.className = 'resource-block create';
            else if (line.includes('updated')) currentBlock.className = 'resource-block update';
            else if (line.includes('destroyed')) currentBlock.className = 'resource-block destroy';
            else if (line.includes('replaced')) currentBlock.className = 'resource-block replace';
            
            const header = document.createElement('h3');
            header.textContent = line;
            currentBlock.appendChild(header);
        } 
        // 解析资源详情
        else if (line.startsWith('resource "') && currentBlock) {
            const resourceLine = document.createElement('div');
            resourceLine.textContent = line;
            currentBlock.appendChild(resourceLine);
        }
        // 解析变更内容（含 -> 符号的行）
        else if (line.includes('->')) {
            if (!currentBlock) return;
            
            const changeLine = document.createElement('div');
            changeLine.className = 'change-line';
            const [before, after] = line.split('->').map(p => p.trim());
            
            changeLine.innerHTML = `
                <span class="old-value">${before}</span>
                <span class="arrow"> → </span>
                <span class="new-value">${after}</span>
            `;
            currentBlock.appendChild(changeLine);
        }
    });
    
    if (currentBlock)
