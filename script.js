$(document).ready(function() {
    // Initialize Select2
    $('.filter-select').select2({
        placeholder: "Select change types",
        width: 'resolve'
    });

    $('#visualize-btn').click(function() {
        const input = $('#terraform-input').val();
        const outputDiv = $('#output');
        outputDiv.empty();
        
        if (!input.trim()) {
            outputDiv.text('Please enter Terraform plan output');
            return;
        }
        
        // Get selected filter options
        const selectedFilters = $('.filter-select').val();
        
        const lines = input.split('\n');
        let currentBlock = null;
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            // Parse resource blocks
            if (line.startsWith('#') && (line.includes('will be created') || 
                                       line.includes('will be updated') || 
                                       line.includes('will be destroyed') || 
                                       line.includes('must be replaced'))) {
                if (currentBlock) {
                    outputDiv.append(currentBlock);
                }
                
                currentBlock = $('<div class="resource-block"></div>');
                const header = $('<div class="resource-header"></div>');
                
                if (line.includes('created')) {
                    currentBlock.addClass('create');
                    header.text('🟢 ' + line);
                } else if (line.includes('updated')) {
                    currentBlock.addClass('update');
                    header.text('🟡 ' + line);
                } else if (line.includes('destroyed')) {
                    currentBlock.addClass('destroy');
                    header.text('🔴 ' + line);
                } else if (line.includes('replaced')) {
                    currentBlock.addClass('replace');
                    header.text('🔵 ' + line);
                }
                
                currentBlock.append(header);
            } 
            // Parse resource details
            else if (line.startsWith('resource "') && currentBlock) {
                currentBlock.append($('<div></div>').text(line));
            }
            // Parse changes
            else if (line.includes('->')) {
                if (!currentBlock) return;
                
                const changeLine = $('<div class="change-line"></div>');
                const [before, after] = line.split('->').map(p => p.trim());
                
                changeLine.append($('<span class="old-value"></span>').text(before));
                changeLine.append($('<span class="arrow"></span>').text('→'));
                changeLine.append($('<span class="new-value"></span>').text(after));
                
                currentBlock.append(changeLine);
            }
        });
        
        if (currentBlock) {
            outputDiv.append(currentBlock);
        }
        
        // Apply filters
        $('.resource-block').each(function() {
            const blockType = $(this).attr('class').split(' ')[1];
            if (selectedFilters && !selectedFilters.includes(blockType)) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
    });
    
    // Re-apply filters when selection changes
    $('.filter-select').on('change', function() {
        if ($('#output').html()) {
            $('#visualize-btn').click();
        }
    });
});
