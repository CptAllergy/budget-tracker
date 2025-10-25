"use client";

import { useEffect } from "react";
import { ExpenseGroupDTO } from "@/types/DTO/dataTypes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser, useExpenseGroups } from "@/utils/hooks/reactQueryUser";
import { ExpenseListType } from "@/types/componentTypes";

export function useHomePageRedirect(
  setFilterId: (filterId: ExpenseListType | undefined) => void
) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useCurrentUser();
  const { expenseGroups } = useExpenseGroups(currentUser);

  useEffect(() => {
    const selectDefaultPage = (groups: ExpenseGroupDTO[]) => {
      if (!groups || groups.length === 0) {
        // Redirect to profile page if no groups are found
        router.push("/profile");
      } else if (
        !searchParams.get("groupId") &&
        (!currentUser?.defaultPage || currentUser?.defaultPage === "profile")
      ) {
        // Redirect to profile page if default page is profile or no default page set
        router.push("/profile");
      } else if (
        !searchParams.get("groupId") &&
        currentUser?.defaultPage === "reports"
      ) {
        // Redirect to reports page if default page is reports
        router.push("/reports");
      } else {
        // Check if groupId provided in the URl is available
        const groupIdParam = searchParams.get("groupId");
        const groupParam = groups.find((group) => group.id === groupIdParam);
        // Add groupId to URL if not found
        if (!groupParam) {
          const params = new URLSearchParams(searchParams);
          params.set("groupId", groups[0].id);
          router.push(`${pathname}?${params.toString()}`);
        }

        // If groupId is not provided or not found, use the first group (favourite group)
        setFilterId({
          groupId: groupParam ? groupParam.id : groups[0].id,
        });
      }
    };

    if (currentUser && expenseGroups) {
      selectDefaultPage(expenseGroups);
    }
  }, [currentUser, expenseGroups, pathname, router, searchParams, setFilterId]);
}
