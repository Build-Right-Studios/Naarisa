import ExcelJS from "exceljs";
import { User } from "../../../MongoDB/models.js";

export const exportUsers = async (req, res) => {
    try {

        const users = await User.find().sort({ createdAt: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Customers");

        worksheet.columns = [
            { header: "Name", key: "name", width: 25 },
            { header: "Phone", key: "phone", width: 18 },
            { header: "Email", key: "email", width: 30 },
            { header: "Orders", key: "orders", width: 12 },
            { header: "Total Spent", key: "spent", width: 18 },
            { header: "Status", key: "status", width: 14 },
            { header: "Created At", key: "createdAt", width: 24 },
        ];

        users.forEach((user) => {
            worksheet.addRow({
                name: user.name || "",
                phone: user.phone || "",
                email: user.email || "",
                orders: user.totalOrders || 0,
                spent: user.totalSpent || 0,
                status: user.isActive ? "ACTIVE" : "INACTIVE",
                createdAt: user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "",
            });
        });

        worksheet.getRow(1).font = {
            bold: true,
        };

        worksheet.getRow(1).height = 22;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=customers.xlsx`
        );

        await workbook.xlsx.write(res);

        res.end();

    } catch (error) {
        console.log("exportUsers Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to export users",
        });
    }
};