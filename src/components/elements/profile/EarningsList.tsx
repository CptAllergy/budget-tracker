"use client";

import { EarningDTO, UserDTO } from "@/types/DTO/dataTypes";
import { timestampToDate } from "@/utils/validations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/commons/Accordion";
import {
  deleteEarningFirebase,
  updateEarningFirebase,
} from "@/services/firebaseService";
import {
  toggleStatusAlert,
  toggleStatusErrorAlert,
} from "@/utils/toggleAlerts";
import { Firestore } from "firebase/firestore";
import { Dispatch, SetStateAction, useContext, useRef, useState } from "react";
import { AlertContext } from "@/contexts/AlertContext";
import { DropdownMenu } from "@/components/commons/menus/DropdownMenu";
import { HiMiniEllipsisHorizontal } from "react-icons/hi2";

import { DeleteDialog } from "@/components/commons/dialogs/DeleteDialog";
import { EditDialog } from "@/components/commons/dialogs/EditDialog";
import { getCategoryIcon } from "@/utils/styles/transactionFilterStyles";

const EarningsList = ({
  earnings,
  setEarnings,
  currentUser,
  db,
}: {
  earnings: EarningDTO[];
  setEarnings: Dispatch<SetStateAction<EarningDTO[]>>;
  currentUser?: UserDTO;
  db: Firestore;
}) => {
  const alertContext = useRef(useContext(AlertContext));

  const removeEarning = async (earning: EarningDTO) => {
    try {
      await deleteEarningFirebase(db, earning, currentUser!, setEarnings);

      toggleStatusAlert(alertContext.current, "Earning deleted");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "DELETE_FAILED", error);
      throw "Error deleting earning";
    }
  };

  const updateEarning = async (earning: EarningDTO) => {
    try {
      await updateEarningFirebase(db, earning, currentUser!, setEarnings);

      toggleStatusAlert(alertContext.current, "Earning updated");
    } catch (error) {
      toggleStatusErrorAlert(alertContext.current, "UPDATE_FAILED", error);
      throw "Error updating earning";
    }
  };
  return (
    <div>
      {currentUser && (
        <EarningsContent
          earnings={earnings}
          currentUser={currentUser}
          removeEarning={removeEarning}
          updateEarning={updateEarning}
        />
      )}
    </div>
  );
};

const EarningsContent = ({
  earnings,
  currentUser,
  removeEarning,
  updateEarning,
}: {
  earnings: EarningDTO[];
  currentUser: UserDTO;
  removeEarning: (earning: EarningDTO) => void;
  updateEarning: (earning: EarningDTO) => void;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [selectedEarning, setSelectedEarning] = useState<EarningDTO>();

  const showDeleteDialog = (earning: EarningDTO) => {
    setSelectedEarning(earning);
    setIsDeleteDialogOpen(true);
  };
  const showEditDialog = (earning: EarningDTO) => {
    setSelectedEarning(earning);
    setIsEditDialogOpen(true);
  };
  return (
    <div>
      <DeleteDialog
        isDialogOpen={isDeleteDialogOpen}
        setIsDialogOpen={setIsDeleteDialogOpen}
        removeEarningData={{ removeEarning, earning: selectedEarning }}
      />
      <EditDialog
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={setIsEditDialogOpen}
        updateEarningData={{ updateEarning, earning: selectedEarning }}
      />
      <div className="mx-auto flex max-w-6xl flex-col">
        <div className="inline-block min-w-full px-3 py-2 align-middle">
          <div className="hidden md:block">
            <EarningTable
              earnings={earnings}
              currentUser={currentUser}
              showDeleteDialog={showDeleteDialog}
              showEditDialog={showEditDialog}
            />
          </div>
          <div className="block md:hidden">
            <EarningCards
              earnings={earnings}
              currentUser={currentUser}
              showDeleteDialog={showDeleteDialog}
              showEditDialog={showEditDialog}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const EarningTable = ({
  earnings,
  currentUser,
  showDeleteDialog,
  showEditDialog,
}: {
  earnings: EarningDTO[];
  currentUser: UserDTO;
  showDeleteDialog: (earning: EarningDTO) => void;
  showEditDialog: (earning: EarningDTO) => void;
}) => {
  return (
    <div className="overflow-hidden rounded-md border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)]">
      <table className="w-full">
        <thead className="bg-theme-secondary border-b-2 border-black">
          <tr>
            <th
              scope="col"
              className="py-3.5 pr-3 pl-6 text-left text-sm font-semibold text-gray-900"
            >
              Description
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Amount
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Category
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
            >
              Date
            </th>
            <th
              scope="col"
              className="py-3.5 text-left text-sm font-semibold text-gray-900"
            ></th>
          </tr>
        </thead>
        <tbody className="bg-theme-highlight divide-y-2 divide-black">
          {earnings.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-3 py-4 text-sm whitespace-nowrap text-gray-500"
              >
                No earnings found
              </td>
            </tr>
          )}
          {earnings.map((earning) => (
            <tr key={earning.id}>
              <td className="w-full max-w-0 truncate py-4 pr-3 pl-6 text-sm font-medium whitespace-nowrap text-gray-900">
                {earning.label}
                <dl className="font-normal lg:hidden">
                  <dt className="mt-1 truncate text-gray-700 sm:hidden">
                    {timestampToDate(earning.timestamp)}
                  </dt>
                </dl>
              </td>
              <td className="px-3 py-4 text-sm font-medium whitespace-nowrap text-emerald-500">
                +{Number(earning.amount).toFixed(2)}€
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                <div className="flex gap-1">
                  <div> {getCategoryIcon(earning.category)}</div>
                  <div> {earning.category}</div>
                </div>
              </td>
              <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 sm:table-cell">
                {timestampToDate(earning.timestamp)}
              </td>
              <td className="relative py-4 pr-4 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                <EarningDropdownMenu
                  selectedEarning={earning}
                  currentUser={currentUser}
                  showDeleteDialog={showDeleteDialog}
                  showEditDialog={showEditDialog}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EarningCards = ({
  earnings,
  currentUser,
  showDeleteDialog,
  showEditDialog,
}: {
  earnings: EarningDTO[];
  currentUser: UserDTO;
  showDeleteDialog: (earningDTO: EarningDTO) => void;
  showEditDialog: (earningDTO: EarningDTO) => void;
}) => {
  return (
    <div>
      {earnings.length === 0 && (
        <div>
          <div className="bg-theme-highlight mt-3 rounded-md border-2 border-black px-3 py-4 text-sm whitespace-nowrap text-gray-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            No earnings found
          </div>
        </div>
      )}
      <Accordion type="single" collapsible className="mt-3 space-y-2 pb-6">
        {earnings.map((earning) => (
          <AccordionItem
            value={earning.id}
            key={earning.id}
            className="bg-theme-highlight rounded-md border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
          >
            <AccordionTrigger className="flex w-full gap-2 px-2">
              <div className="flex-1 space-x-1 truncate text-left text-sm font-medium whitespace-nowrap">
                <span className="align-baseline text-lg leading-none">
                  {getCategoryIcon(earning.category)}
                </span>
                <span className="align-baseline text-gray-900">
                  {earning.label}
                </span>
              </div>
              <span className="text-sm whitespace-nowrap text-gray-500/50">
                {Number(earning.amount).toFixed(2)}€
              </span>
            </AccordionTrigger>
            <AccordionContent className="bg-theme-secondary rounded-b-md border-t-2 border-black px-2.5 py-1">
              <div className="flex justify-between">
                <div>
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    Category
                  </dt>
                  <dd className="mb-2 font-semibold text-black/70">
                    {earning.category}
                  </dd>
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    Tags
                  </dt>
                </div>
                <dl className="text-right">
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    Date
                  </dt>
                  <dd className="mb-2 font-semibold text-black/70">
                    {timestampToDate(earning.timestamp)}
                  </dd>
                  <dt className="mb-0.5 text-xs font-medium text-black/40">
                    User
                  </dt>
                </dl>
              </div>
              <div className="text-right">
                <EarningDropdownMenu
                  selectedEarning={earning}
                  currentUser={currentUser}
                  showDeleteDialog={showDeleteDialog}
                  showEditDialog={showEditDialog}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const EarningDropdownMenu = ({
  selectedEarning,
  currentUser,
  showDeleteDialog,
  showEditDialog,
}: {
  selectedEarning: EarningDTO;
  currentUser: UserDTO;
  showDeleteDialog: (earning: EarningDTO) => void;
  showEditDialog: (earning: EarningDTO) => void;
}) => {
  return (
    <div>
      {currentUser.id === selectedEarning.userId && (
        <DropdownMenu
          menuButton={
            <div className="bg-theme-main hover:bg-theme-hover inline-flex rounded-md border-2 border-black px-3 py-0.5 text-white transition-colors md:px-1 md:py-1">
              <HiMiniEllipsisHorizontal size={20} />
            </div>
          }
          menuItems={[
            {
              icon: <></>,
              label: "Edit",
              onClick: () => {
                showEditDialog(selectedEarning);
              },
            },
            {
              icon: <></>,
              label: "Delete",
              onClick: () => {
                showDeleteDialog(selectedEarning);
              },
            },
          ]}
        />
      )}
    </div>
  );
};

export default EarningsList;
