// Helper function to create a button
function createButton(scene, x, y, textureKey, dataKey, boxSize) {
    const button = scene.add.sprite(x, y, textureKey + '_default');
    button.setData(dataKey, false);
    button.setOrigin(0);
    button.displayWidth = boxSize / 2;
    button.displayHeight = boxSize / 2;
    button.setInteractive();
    button.on('pointerdown', () => toggleButtonState(button, textureKey, dataKey));
    return button;
}

// Function to handle pointer events and toggle button state
function toggleButtonState(button, textureKey, dataKey) {
    const isSelected = button.getData(dataKey);
    button.setTexture(textureKey + (isSelected ? '_default' : '_clicked'));
    button.setData(dataKey, !isSelected);
    console.log(`${dataKey}: ${!isSelected}`);
}
