resource "aws_secretsmanager_secret" "service_secrets" {
  for_each = var.secrets

  name        = "ecommerce/${each.key}"
  description = "Secrets for ${each.key} service"

  tags = var.tags
}

resource "aws_iam_role" "external_secrets" {
  name = "external-secrets-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${var.oidc_provider}"
        }
        Condition = {
          StringEquals = {
            "${var.oidc_provider}:sub": "system:serviceaccount:external-secrets:external-secrets"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "external_secrets" {
  name = "external-secrets-policy"
  role = aws_iam_role.external_secrets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          for secret in aws_secretsmanager_secret.service_secrets : secret.arn
        ]
      }
    ]
  })
}
