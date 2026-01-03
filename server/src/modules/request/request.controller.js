import Request from "./request.model.js";
import { ObjectId } from "mongodb";

// ================== Get All ==================
export const getRequests = async (req, res) => {
  try {
    const requests = await Request.getAll();
    return res.status(200).json(requests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch requests", error: error.message });
  }
};

// ================== Get By ID ==================
export const getRequestById = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Request ID" });
  }
  try {
    const request = await Request.getById(id);
    if (!request)
      return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch request", error: error.message });
  }
};

// ================== Add ==================
export const addRequest = async (req, res) => {
  const newRequestData = req.body;
  try {
    const request = await Request.create(newRequestData);
    return res.status(201).json(request);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add request", error: error.message });
  }
};

// ================== Update ==================
export const updateRequest = async (req, res) => {
  const { id } = req.params;
  const { status, remarks, ...rest } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Request ID" });
  }

  try {
    const existing = await Request.getById(id);
    if (!existing)
      return res.status(404).json({ message: "Request not found" });

    // Merge old data + new updates
    const updatedData = {
      ...existing,
      ...rest,
      ...(status && { status }),
      ...(remarks && { remarks }),
    };

    const updatedRequest = await Request.update(id, updatedData);

    res.status(200).json({
      message: "Request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update request", error: error.message });
  }
};

// ================== Delete ==================
export const deleteRequest = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Request ID" });
  }
  try {
    const deletedCount = await Request.delete(id);
    if (deletedCount === 0)
      return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete request", error: error.message });
  }
};

// ================== Filters ==================
export const getRequestsByAgent = async (req, res) => {
  const { agentName } = req.params;
  try {
    const requests = await Request.getByAgent(agentName);
    return res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch requests by agent",
      error: error.message,
    });
  }
};

export const getRequestsBySupervisor = async (req, res) => {
  const { supervisor } = req.params;
  try {
    const requests = await Request.getBySupervisor(supervisor);
    return res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch requests by supervisor",
      error: error.message,
    });
  }
};

export const getRequestsByStatus = async (req, res) => {
  const { status } = req.params;
  try {
    const requests = await Request.getByStatus(status);
    return res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch requests by status",
      error: error.message,
    });
  }
};

export const getRequestsByType = async (req, res) => {
  const { type } = req.params;
  try {
    const requests = await Request.getByType(type);
    return res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch requests by type",
      error: error.message,
    });
  }
};

// ================== Approve ==================
export const approveRequest = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  if (!ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid Request ID" });

  try {
    const updated = await Request.update(id, {
      status: "Approved",
      ...(remarks && { remarks }),
    });
    if (!updated)
      return res.status(404).json({ message: "Request not found" });
    res
      .status(200)
      .json({ message: "Request approved successfully", request: updated });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve request",
      error: error.message,
    });
  }
};

// ================== Reject ==================
export const rejectRequest = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  if (!ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid Request ID" });

  try {
    const updated = await Request.update(id, {
      status: "Rejected",
      ...(remarks && { remarks }),
    });
    if (!updated)
      return res.status(404).json({ message: "Request not found" });
    res
      .status(200)
      .json({ message: "Request rejected successfully", request: updated });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject request",
      error: error.message,
    });
  }
};
