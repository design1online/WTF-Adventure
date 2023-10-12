const Bank = () => {
    return (
        <div id="bank">
            <div id="closeBank" className="close"></div>
            <div id="bankContainer">
              <div id="bankSlots">
                <ul></ul>
              </div>
            </div>
            <div id="bankInventoryContainer">
              <div id="bankInventorySlots" className="inventorySlots">
                <ul></ul>
              </div>
            </div>
        </div>
    )
}

export default Bank;