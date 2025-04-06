import { Inventory } from "@/components/inventory";
import { Component } from "@/lib/types";
import { useState, useEffect } from "react";
import { getInventoryItems } from "@/lib/services/game-save.service";

type InventorySectionProps = {
  items: any[];
  gameSaveId: string;
  onEquipItem: (itemId: string, equip: boolean) => void;
  onActiveItemChange: (itemId: string | null) => void;
  onUseItem: (itemId: string) => Promise<boolean>;
}

const InventorySection: Component<InventorySectionProps> = ({ 
  items, 
  gameSaveId,
  onEquipItem, 
  onActiveItemChange, 
  onUseItem 
}) => {
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      if (!gameSaveId) {
        setInventoryItems(items || []);
        setLoading(false);
        return;
      }

      try {
        const inventoryData = await getInventoryItems(gameSaveId);
        
        const formattedItems = inventoryData.map(invItem => ({
          id: invItem.item.id,
          name: invItem.item.name,
          description: invItem.item.description,
          type: invItem.item.type,
          rarity: invItem.item.rarity,
          effect: invItem.item.effect,
          durability: invItem.item.durability,
          remainingUses: invItem.remainingUses,
          imageUrl: invItem.item.imageUrl,
          brokenImageUrl: invItem.item.brokenImageUrl,
          quantity: invItem.quantity,
          isEquipped: invItem.isEquipped,
          isBroken: invItem.isBroken,
          inventoryItemId: invItem.id
        }));
        
        setInventoryItems(formattedItems);
      } catch (error) {
        console.error("Error loading inventory:", error);
        setInventoryItems(items || []);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [gameSaveId, items]);

  if (loading) {
    return <div className="mt-4 p-4 bg-gray-800/20 rounded-md">Loading inventory...</div>;
  }

  return (
    <Inventory
      items={inventoryItems}
      onEquipItem={onEquipItem}
      onActiveItemChange={onActiveItemChange}
      onUseItem={onUseItem}
    />
  );
};

export default InventorySection;