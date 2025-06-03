package com.kassa.privates.items;

import net.minecraft.component.DataComponentTypes;
import net.minecraft.item.ItemStack;
import net.minecraft.item.Items;
import net.minecraft.text.Text;
import net.minecraft.util.Formatting;

public class SelectionStick {
    
    public static void init() {
    }
    
    public static ItemStack createSelectionStick() {
        ItemStack stick = new ItemStack(Items.STICK);
        
        stick.set(DataComponentTypes.CUSTOM_NAME, 
            Text.literal("Private Selection Stick")
                .formatted(Formatting.GOLD, Formatting.BOLD));
        
        return stick;
    }
    
    public static boolean isSelectionStick(ItemStack stack) {
        if (stack.isEmpty() || !stack.isOf(Items.STICK)) {
            return false;
        }
        
        Text customName = stack.get(DataComponentTypes.CUSTOM_NAME);
        if (customName == null) return false;
        
        return customName.getString().equals("Private Selection Stick");
    }
}