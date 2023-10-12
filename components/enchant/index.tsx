const Enchant = () => {
    return (
        <div id="enchant">
            <div id="closeEnchant" className="close"></div>
            <div id="confirmEnchant" className="ok"></div>
            <div id="enchantContainer">
              <div id="enchantInventorySlots" className="inventorySlots">
                <ul></ul>
              </div>
            </div>
            <div id="enchantSelectedItem"></div>
            <div id="enchantShards">
              <div id="shardsCount"></div>
            </div>
        </div>
    )
}

export default Enchant;