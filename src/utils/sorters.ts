import { ExpenseGroupDTO } from "@/types/DTO/dataTypes";

export function sortExpenseGroups(
  groups: ExpenseGroupDTO[],
  favouriteGroup?: string
) {
  // Sort groups by name
  const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name));

  // Move the favourite group to the top if it exists
  if (favouriteGroup) {
    const favouriteIndex = sortedGroups.findIndex(
      (group) => group.id === favouriteGroup
    );
    if (favouriteIndex !== -1) {
      const [favouriteGroup] = sortedGroups.splice(favouriteIndex, 1);
      sortedGroups.unshift(favouriteGroup);
    }
  }

  return sortedGroups;
}
