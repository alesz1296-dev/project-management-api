-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "RefreshTokenRecord_expiresAt_idx" ON "RefreshTokenRecord"("expiresAt");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "Task_createdBy_idx" ON "Task"("createdBy");

-- CreateIndex
CREATE INDEX "Task_status_priority_idx" ON "Task"("status", "priority");
