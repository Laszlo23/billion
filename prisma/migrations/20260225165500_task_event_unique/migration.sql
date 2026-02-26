-- CreateIndex
CREATE UNIQUE INDEX "TaskEvent_userId_type_referenceId_key" ON "TaskEvent"("userId", "type", "referenceId");
