
import React from "react";
import DashboardOverview from "./DashboardOverview";
import AllocationSummary from "./AllocationSummary";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Dashboard = ({ scheduleData }) => {
  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="allocation">Allocation Summary</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <DashboardOverview />
      </TabsContent>

      <TabsContent value="allocation">
        <AllocationSummary data={scheduleData} />
      </TabsContent>
    </Tabs>
  );
};

export default Dashboard;
